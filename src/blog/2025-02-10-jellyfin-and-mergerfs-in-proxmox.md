---
title: Jellyfin and mergerfs in Proxmox
tags: ["tutorial", "media"]
created: 2025-02-10T00:00:00-05:00
---

==This is not a tutorial for setting up Jellyfin itself.==

[![mergerfs github](/uploads/mergerfs.png)](https://github.com/trapexit/mergerfs)

As someone who has used Jellyfin pretty much since the initial Emby fork, I've had many years to tweak and optimize parts of my setup. After several iterations, my current configuration has been the longest serving and stablest by far.

One of its core components being [mergerfs](https://trapexit.github.io/mergerfs/latest/).

### What is mergerfs?
> mergerfs is a FUSE based union filesystem geared towards simplifying storage and management of files across numerous commodity storage devices. It is similar to mhddfs, unionfs, and aufs.
> <cite>[trapexit/mergerfs](https://github.com/trapexit/mergerfs)</cite>

If just one thing is taken away, let it be "union filesystem." Essentially, mergerfs lets you pool multiple directories or filesystems into a single mount point. There are many reasons you might want to achieve this, but my use case is for serving media and metadata for Jellyfin together efficiently.

### A top-down view
More specifically, the media itself, located on a NAS, is mounted as an SMB share on the Proxmox host. This share is passed to the Jellyfin container as a R/O mount point. The metadata - including .nfo's, images, and subtitles - are located directly in the container.

![Proxmox with mergerfs flow chart](/uploads/Jellyfin_mergerfs_Proxmox-2026-03-16-194306.svg)

### Why merge these directories?
While I've always preferred the concept of keeping metadata next to my media files, two deal breakers have deterred me:

1. **Security**: The media share accessed by Jellyfin must be read-only. I don't want the container to have any means to delete or alter data on my NAS. Of course, this means Jellyfin wouldn't be able to create or modify metadata next to the media.
2. **Performance**: Even if I work around the security issue, serving metadata alongside the media on mechanical hard drives could be a bit... clunky.

Using mergerfs provides a solution that is...
- **Secure**: Messing with media files through the container is prohibited, but metadata manipulation is still allowed.
- **Speedy**[^1]: Artwork and other metadata is served to clients much quicker on the host NVME than if they were located on the NAS.
- **Organized**: The metadata folder structure mirrors what I'm used to.
- **Flexible**: Kodi, Plex, Jellyfin, and Emby should all recognize my collection properly via the merged mount.

### The Setup

Keep in mind that for this setup, I'll be using my actual directories, so be sure to change them wherever appropriate.

The first piece in this equation is making sure the media share is available in the LXC. The simplest way to achieve this is by first mounting it on the Proxmox host itself.

Here's the line in my host's `fstab` that accomplishes that:

```txt
//nas/Media /mnt/lxc_shares/media cifs vers=3.0,_netdev,x-systemd.automount,noatime,uid=100000,gid=110000,dir_mode=0770,file_mode=0770,credentials=/etc/.smb-cred-media,defaults 0 0
```

Permission-wise, this line provides a couple of ways for container users to access the share. First, the `root` user of an unprivileged LXC has full access. In addition, LXC users that are added to the group `110000` have full access. (Thanks [@jims-garage](https://github.com/JamesTurland/JimsGarage/tree/main/LXC/NAS))

Since the SMB credentials are stored in a separate file, they need to be secured by executing:
```shell
sudo chown root:root /etc/.smb-cred-media
sudo chmod 600 /etc/.smb-cred-media
```

Next, the unprivileged Jellyfin container is given access to the host mount by adding the following line to its `/etc/pve/lxc/{lxc_id}.conf` config file:

```txt
mp0: /mnt/lxc_shares/media/,mp=/mnt/media,ro=1
```

Note the `ro=1` setting that ensures the mount point is read-only.

After a quick reboot, a read-only `/mnt/media` mount point should pop up on the Jellyfin container.

#### The merge

It's important to first understand the layout of the directories involved in the merge. Here is a sample from my media mount:

```txt
/mnt/media/
// [!code highlight:4]
├─ Movies/
│  ├─ A Goofy Movie (1995) [imdbid-tt0113198]/
│  │  ├─ A Goofy Movie (1995) [imdbid-tt0113198].mkv
│  │  ├─ trailer.mkv
```

and another matching sample of the meta folder located directly on the LXC:

```txt
/srv/docker-data/jellyfin/meta/
// [!code highlight:8]
├─ Movies/
│  ├─ A Goofy Movie (1995) [imdbid-tt0113198]/
│  │  ├─ A Goofy Movie (1995) [imdbid-tt0113198].nfo
│  │  ├─ A Goofy Movie (1995) [imdbid-tt0113198].en.srt
│  │  ├─ backdrop.jpg
│  │  ├─ folder.jpg
│  │  ├─ landscape.jpg
│  │  ├─ logo.png
```

As you can see, the directories are perfectly mirrored, yet serve different content. The final merged directory consists of all of the content from both original directory trees.

With that, let's move on to the mergerfs configuration.

On Debian or Ubuntu, mergerfs can be installed using:

```shell
sudo apt update
sudo apt install mergerfs
```

After installation, really the only configuration is to modify the container's `fstab`. I've added the following line to mine:

```txt
/srv/docker-data/jellyfin/meta:/mnt/media /srv/docker-data/jellyfin/media fuse.mergerfs defaults,allow_other,use_ino,category.create=epmfs 0 0
```

Take note of the option `allow_other` at the end of the line, which ensures that users other than the mount-er have access to the merged directory.

After saving the `fstab`, the merged directory can be created and mounted via

```shell
sudo mkdir -p /srv/docker-data/jellyfin/media
sudo mount -a
```

leaving the final merged directory looking like this:

```txt
/srv/docker-data/jellyfin/media/
├─ Movies/
│  ├─ A Goofy Movie (1995) [imdbid-tt0113198]/
│  │  ├─ A Goofy Movie (1995) [imdbid-tt0113198].mkv
│  │  ├─ A Goofy Movie (1995) [imdbid-tt0113198].nfo
│  │  ├─ A Goofy Movie (1995) [imdbid-tt0113198].en.srt
│  │  ├─ backdrop.jpg
│  │  ├─ folder.jpg
│  │  ├─ landscape.jpg
│  │  ├─ logo.png
│  │  ├─ trailer.mkv
```

Because I use Docker for Jellyfin, I also added edited its service file with `systemctl edit docker` to ensure Docker only starts after the merged directory is accessible:

```ini
[Unit]
RequiresMountsFor=/srv/docker-data/jellyfin/media
After=local-fs.target
```

That's pretty much all there is to it! All media is imported into Jellyfin through the merged directory. With *NFO* selected as the metadata saver and *Save artwork into media folders* enabled, Jellyfin will write metadata files to `/srv/docker-data/jellyfin/meta/` through the merged directory.[^2]

[^1]: mergerfs is [FUSE](https://en.wikipedia.org/wiki/Filesystem_in_Userspace) based. User-space filesystem implementations can struggle to match the speed of traditional kernel-space due to all the context switches and sys calls in the chain of operations. *Could* this setup be more efficient? In theory.

    But to put it bluntly, I don't find the idea of making a container privileged *just* to chase hypothetical performance gains really necessary.

[^2]: When adding media, a skeleton of the media's folder structure must be present in the meta directory before importing to Jellyfin.
