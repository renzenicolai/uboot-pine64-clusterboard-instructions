# Installing Arch Linux

## Download rootfs

`wget http://os.archlinuxarm.org/os/ArchLinuxARM-aarch64-latest.tar.gz`

## Mount the root partition

Mount it somewhere.

## Installing the rootfs

`sudo bsdtar -xpf ArchLinuxARM-aarch64-latest.tar.gz -C /where/you/mounted/root`

## Installing the devicetree

Copy `sun50i-a64-sopine-clusterboard.dtb` to the root filesystem:

`sudo cp sun50i-a64-sopine-clusterboard.dtb /where/you/mounted/root/boot/dtbs/allwinner/`

## Installing the boot script

Copy boot.scr to the boot partition.

If you want to change the bootscript you can generate boot.scr from boot.cmd using the following command:

`mkimage -C none -A arm -T script -d boot.cmd boot.scr`

