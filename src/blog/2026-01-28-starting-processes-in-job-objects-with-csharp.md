---
title: Starting processes in job objects with C#
---

Raymond Chen wrote a helpful [article](https://devblogs.microsoft.com/oldnewthing/20230209-00/?p=107812) explaining the safest method of starting a process directly in a job object on Windows 10 and above. (I say "safest", because it avoids a pesky race condition cleanly and effectively; but more on that later.) Working directly with the Windows API in C# is a different story. Nevertheless, it's something we must do when attempting to replicate Chen's logic.

## Creating a job object
It's recommended that modern .NET apps use [CsWin32](https://github.com/microsoft/CsWin32) for P/Invoke support, so that's what we'll do. At this point, our `NativeMethods.txt` only needs one entry:

```
CreateJobObject
```

And with this method, it becomes very simple to create job objects:

```cs
public static SafeFileHandle CreateJobHandle()
{
    var safeJobHandle = PInvoke.CreateJobObject(null, null);

    if (safeJobHandle.IsInvalid)
        // Error handling

    return safeJobHandle;
}
```

### As an aside
You'll notice I won't take up space writing any error handling in this article. As a general WinAPI rule, when a system function fails, it will usually return `0`. To obtain the error code and create an exception, you can do something like:

```cs
var errorCode = Marshal.GetLastPInvokeError();
var win32Ex = new Win32Exception(errorCode);
```

With that being said, let's move on to the main course... How can we start a process *in* our newly created job object?

## The gotchas of the Process class
Looking at Microsoft's [documentation](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process?view=net-10.0) for .NET's `Process` class, we see many useful members. We can use a `StartInfo` object to set characteristics of the process before starting it. We can even access the underlying OS handle with `Process.Handle`.

What we *can't* do is manipulate the process's native attribute list.

You may be thinking - "Can't you just start the process, obtain its handle, and use it to add the process to the job object?" You can, and it might look something like:

```cs
using var process = new Process();
process.StartInfo.FileName = "notepad.exe";

process.Start();
// Race condition here
PInvoke.AssignProcessToJobObject(jobHandle, process.Handle);
```

Though, as noted above, this method technically introduces races. A process can start and immediately exit before the next instruction is reached, in which case the `AssignProcessToJobObject` call will certainly fail. Or a process can start and immediately spawn its own children before being added to the job object, leaving them orphaned.

These possibilities are too dangerous to ignore, which is why typical methodology involves creating the process suspended, adding it to the job object, and resuming execution.

As you can guess, starting processes suspended [isn't possible with .NET](https://github.com/dotnet/runtime/issues/94127) at the moment. You would still have to rely on more P/Invoke to replicate this technique in C#. However, on newer versions of Windows this strategy is obsolete anyway. As Chen notes, there is a modern process attribute we can take advantage of...

## PROC_THREAD_ATTRIBUTE_JOB_LIST
According to the [Microsoft docs](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-updateprocthreadattribute#parameters), `PROC_THREAD_ATTRIBUTE_JOB_LIST` is a "pointer to a list of job handles to be assigned to the child process." Essentially a golden ticket for our needs (**assuming you're using Windows 10 or later**). By assigning the job object to our future process's extended attribute list before it is created, we can effectively avoid "hacky" solutions involving process suspension altogether.

To get started, we're going to need several more entries in `NativeMethods.txt`. It should now include the following:

```
CloseHandle
CreateJobObject
CreateProcess
DeleteProcThreadAttributeList
InitializeProcThreadAttributeList
UpdateProcThreadAttribute
PROC_THREAD_ATTRIBUTE_*
PROCESS_CREATION_FLAGS
PROCESS_INFORMATION
STARTUPINFOW
STARTUPINFOEXW
```

First, I'll design a minimal wrapper class for the process itself:

```cs
public sealed class Process : IDisposable
{
    private SafeFileHandle? _safeProcHandle;

    public string Path { get; }

    public Process(string path)
    {
        Path = path;
    }

    public void Dispose()
    {
        _safeProcHandle?.Dispose();
        _safeProcHandle = null;
    }
}
```

The method for actually starting our process in a given job object will end up quite hefty, so I'll break it into chunks.

Determining the size of the memory needed to store our process's attribute list is the first step:

```cs
public unsafe void StartInJob(SafeFileHandle safeJobHandle)
{
    nuint size;

    _ = PInvoke.InitializeProcThreadAttributeList(
        LPROC_THREAD_ATTRIBUTE_LIST.Null, 1, 0, &size);

    nint listBuffer = Marshal.AllocHGlobal((nint)size);
    var list = (LPROC_THREAD_ATTRIBUTE_LIST)listBuffer;
```

The initial call to `InitializeProcThreadAttributeList` is expected to fail. Because we passed a null value as the first argument, along with the required number (1) of attributes our list will contain, Windows populated `size` with the required buffer size. We then allocated the necessary buffer size as unmanaged memory and treated it as an attribute list.

Next, we'll call the function again to initialize the list and then update the job list attribute with the handle to our job object:

```cs
try
{
    if (!PInvoke.InitializeProcThreadAttributeList(list, 1, 0, &size))
        // Error handling

    HANDLE jobHandle = (HANDLE)safeJobHandle.DangerousGetHandle();

    if (!PInvoke.UpdateProcThreadAttribute(
        list, 0, PInvoke.PROC_THREAD_ATTRIBUTE_JOB_LIST,
        &jobHandle, (nuint)sizeof(HANDLE)))
        // Error handling
```

The process's startup info and path should now be prepared:

```cs
STARTUPINFOEXW siex = new()
{
    lpAttributeList = list
};
siex.StartupInfo.cb = (uint)sizeof(STARTUPINFOEXW);

char[] cmd = (Path + '\0').ToCharArray(); // Must be null terminated
Span<char> lpCommandLine = cmd;
```

Because `PROC_THREAD_ATTRIBUTE_JOB_LIST` is an extended attribute, we needed to use a `STARTUPINFOEX` structure. It's essentially a wrapper for `STARTUPINFO` along with the attribute list for the process.

Additionally, as per the [Microsoft docs](https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-startupinfoexa#remarks), the `cb` member of `STARTUPINFOEX.StartupInfo` *must* be assigned the size of its wrapping structure when using an extended startup info structure.

We can now finally create the process:

```cs
PROCESS_INFORMATION pi;

if (!PInvoke.CreateProcess(
    null, ref lpCommandLine, null, null, false,
    PROCESS_CREATION_FLAGS.EXTENDED_STARTUPINFO_PRESENT,
    null, null, in siex.StartupInfo, out pi))
    // Error handling
```

Note that [another requirement](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessa#parameters) of using extended attributes is that `EXTENDED_STARTUPINFO_PRESENT` *must* be specified in the `dwCreationFlags` parameter of our `CreateProcess` call.

In the above code block, I've declared `pi` explicitly for clarity. We're now going to use it to obtain a handle to the newly created process. Afterward, we'll write some final necessary cleanup.

```cs
    _safeProcHandle = new SafeFileHandle(pi.hProcess, ownsHandle: true);

    // Not using this. Handle must be closed.
    _ = PInvoke.CloseHandle(pi.hThread);
}
finally
{
    PInvoke.DeleteProcThreadAttributeList(list);
    Marshal.FreeHGlobal(listBuffer);
}
```

By passing `true` to the `ownsHandle` parameter, we relinquished ownership of the process handle and responsibility of its lifetime. At this point, our custom `Process` object will finally own a safe handle to the system process. When `Dispose()` is called on `_safeProcHandle`, .NET will take care of closing the system handle for us.

`hThread`, however, is a handle we have no plans of using. Technically, [it will be closed](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/ns-processthreadsapi-process_information#remarks) by the system when its parent process terminates. Though it is still more responsible to expressly call the `CloseHandle` function, as seen above.

Lastly, it's vital not to forget the attribute list and the unmanaged memory we allocated for it earlier.

## The complete package
It took a while, but we've now constructed a custom solution that can start a system process in a given job object. Putting the whole thing together, it looks like this:

```cs
public sealed class Process : IDisposable
{
    private SafeFileHandle? _safeProcHandle;

    public string Path { get; }

    public Process(string path)
    {
        Path = path;
    }

    public unsafe void StartInJob(SafeFileHandle safeJobHandle)
    {
        nuint size;

        _ = PInvoke.InitializeProcThreadAttributeList(
            LPROC_THREAD_ATTRIBUTE_LIST.Null, 1, 0, &size);

        nint listBuffer = Marshal.AllocHGlobal((nint)size);
        var list = (LPROC_THREAD_ATTRIBUTE_LIST)listBuffer;

        try
        {
            if (!PInvoke.InitializeProcThreadAttributeList(list, 1, 0, &size))
                // Error handling

            HANDLE jobHandle = (HANDLE)safeJobHandle.DangerousGetHandle();

            if (!PInvoke.UpdateProcThreadAttribute(
                list, 0, PInvoke.PROC_THREAD_ATTRIBUTE_JOB_LIST,
                &jobHandle, (nuint)sizeof(HANDLE)))
                // Error handling

            STARTUPINFOEXW siex = new()
            {
                lpAttributeList = list
            };
            siex.StartupInfo.cb = (uint)sizeof(STARTUPINFOEXW);

            char[] cmd = (Path + '\0').ToCharArray(); // Must be null terminated
            Span<char> lpCommandLine = cmd;

            PROCESS_INFORMATION pi;

            if (!PInvoke.CreateProcess(
                null, ref lpCommandLine, null, null, false,
                PROCESS_CREATION_FLAGS.EXTENDED_STARTUPINFO_PRESENT,
                null, null, in siex.StartupInfo, out pi))
                // Error handling

            _safeProcHandle = new SafeFileHandle(pi.hProcess, ownsHandle: true);

            // Not using this. Handle must be closed.
            _ = PInvoke.CloseHandle(pi.hThread);
        }
        finally
        {
            PInvoke.DeleteProcThreadAttributeList(list);
            Marshal.FreeHGlobal(listBuffer);
        }
    }

    public void Dispose()
    {
        _safeProcHandle?.Dispose();
        _safeProcHandle = null;
    }
}
```

Next steps in extending the class might include adding an "exited" event handler using a wait handle, but that's for another post.
