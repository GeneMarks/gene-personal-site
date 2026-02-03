---
title: Jellyfin and mergerfs in Proxmox
---

[![mergerfs github](/assets/blog/mergerfs.png)](https://github.com/trapexit/mergerfs)

As someone who has used Jellyfin pretty much since the initial Emby fork, I've had many years to tweak and optimize parts of my setup. After several iterations, my current structure has been the longest serving and most stable by far.

Its heart and soul being **mergerfs**.

## What is mergerfs?
> mergerfs is a FUSE based union filesystem geared towards simplifying storage and management of files across numerous commodity storage devices. It is similar to mhddfs, unionfs, and aufs.<cite>[trapexit/mergerfs](https://github.com/trapexit/mergerfs)</cite>

If just one thing is taken away, let it be "*union filesystem*." Essentially, mergerfs lets you pool multiple directories or filesystems into a single mount point. There are many reasons you might want to achieve this, but my main use case is for serving the media and metadata for Jellyfin together in a Proxmox LXC.

More specifically, the media itself, located on a NAS, is mounted as a read-only SMB share. The metadata - including .nfo's, images, and subtitles - are located directly in the Jellyfin container.

## Why merge these directories?
While I've always preferred the concept of keeping metadata next to my media files, two deal breakers have kept me from actually doing it.

1. **Security**: The media share accessed by Jellyfin must be read-only. I don't want the container to have any means to delete or alter my data. Of course, this means Jellyfin wouldn't be able to create or modify metadata next to the media.
2. **Performance**: Even if I work around the security issue, serving metadata alongside the media on my 'ol mechanical HDDs could be a bit... clunky.

Using mergerfs gives us a solution that is...
- **Secure**: Messing with media files through the container is impossible while still allowing metadata manipulation.
- **Speedy**: Artwork and other metadata will be served to clients much quicker on the local NVME than if they were located on the NAS.
- **Organized**: The *meta* folder structure mimics what we're used to putting media in.
- **Flexible**: Kodi, Plex, Jellyfin, and Emby should all recognize your collection properly via the merged mount.

## The Setup
The first peice in this equation is making sure your media share is available in the LXC. The simplest way to achieve this is by first mounting it on the Proxmox host itself.

Here's the line in my fstab that accomplishes that:

`//nas/Media /mnt/lxc_shares/media cifs vers=3.0,_netdev,x-systemd.automount,noatime,uid=100000,gid=110000,dir_mode=0770,file_mode=0770,credentials=/etc/.smb-cred-media,ro,defaults 0 0`

This entry supplies read-only access to the uid that root container users are mapped to on the host, as well as a gid that you can add additional users to. If storing your smb credentials in a seperate file like I do, **make sure** you set its permissions to 600 and ensure root is the owner!

Next, you'll need to give the unprivileged Jellyfin container access to the mount by adding the following line to its `/etc/pve/lxc/{lxc_id}.conf` file:

`mp0: /mnt/lxc_shares/media/,mp=/mnt/media`

After a reboot, you should see a readable /mnt/media share on the Jellyfin container.

*Now comes the fun part.*

Before installing mergerfs, we need to understand the layout of the directories involved in the merge. Here is a sample of my media mount:

```
/mnt/media/
├─ Movies/
│  ├─ A Goofy Movie (1995) [imdbid-tt0113198]/
│  │  ├─ A Goofy Movie (1995) [imdbid-tt0113198].mkv
│  │  ├─ trailer.mkv
```

and another matching sample of the meta folder:

```
/srv/docker-data/jellyfin/meta/
├─ Movies/
│  ├─ A Goofy Movie (1995) [imdbid-tt0113198]/
│  │  ├─ A Goofy Movie (1995) [imdbid-tt0113198].nfo
│  │  ├─ A Goofy Movie (1995) [imdbid-tt0113198].en.srt
│  │  ├─ backdrop.jpg
│  │  ├─ folder.jpg
│  │  ├─ landscape.jpg
│  │  ├─ logo.png
```

As you can see, the paths are mirrored yet different files are served.

After installing mergerfs with your container's package manager, you'll want to add an entry to your fstab that looks like mine:

`/srv/docker-data/jellyfin/meta:/mnt/media /srv/docker-data/jellyfin/media fuse.mergerfs defaults,allow_other,use_ino,category.create=epmfs 0 0`

If you're using Docker, you should also add the following to its service file with `systemctl edit docker` to ensure it only starts after our media mount is accessible:

```ini
[Unit]
RequiresMountsFor=/srv/docker-data/jellyfin/media
After=local-fs.target
```

That's pretty much all there is to it! Restart, boot up Jellyfin and use the `media` folder as the source for your libraries. Oh, and enable the library settings that save .nfo's and artwork next to media.

## Caveats
mergerfs is [FUSE](https://en.wikipedia.org/wiki/Filesystem_in_Userspace) based. It's acknowledged that user-space filesystem implementations can struggle to match the speed of traditional kernel-space due to all of the context switches and sys calls in the chain of operations. *Could* this setup be more efficient? In theory.

But to put it bluntly, I don't find the idea of making a container privileged *just* to chase numerical performance gains all that necessary.
