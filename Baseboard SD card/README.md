# Booting a SoPine module from SD card

This section contains installation instructions for installing U-boot onto an SD card for use with a SoPine module installed into a Baseboard.

Note that in the following instructions the SD card device path is shown as `/dev/mmcblkX`. Please replace this path with the correct path for your system in all of the commands below.

## 1. Download the bootloader

Download the file "u-boot-sunxi-with-spi.bin" from this folder.

## 2. Partitioning the SD card

First wipe the start of the SD card using

`dd if=/dev/zero of=/dev/mmcblkX bs=1M count=8`

You can then use fdisk to partition the SD card, simply run

`fdisk /dev/mmcblkX`

To create the boot partition:

 - Press `o` to create a DOS partition table
 - Press `n` to create a new partition
 - Enter `p` at the prompt for partition type (to create a primary partition)
 - Enter `1` at the prompt for partition number (to create partition number 1)
 - Enter When asked for the first sector enter `4096`
 - Enter enter the size of the boot partition (`+128M` for a 128MB partition)

To create the root partition:

 - Press `p` to print the partition table
 - Press `n` to create a new partition
 - Enter `p` at the prompt for partition type (to create a primary partition)
 - Enter `2` at the prompt for partition number (to create partition number 2)
 - When asked for the first sector enter the value shown as the `end` value for the first partition, incremented by 1
 - When asked for the last sector hit enter to accept the default value, this will create a partition that fills the rest of the SD card

## 3. Writing the bootloader

Copy the bootloader to the start of the SD card using the following command:

`sudo dd if=u-boot-sunxi-with-spl.bin of=/dev/mmcblkX bs=8k seek=1`

## 4. Boot partition

The environment and boot related files are stored on the first partition, which you can format as FAT using the following command:

`sudo mkfs.msdos /dev/mmcblkXp1`

When saved using `saveenv` the environment will be stored as a file called `uboot.env` in this partition. The partition can also contain the bootscript (`boot.scr`), kernel and ramdisk. I recommend you mount this partition as /boot.

## Default boot command

`load mmc 0:1 ${scriptaddr} /boot.scr; source ${scriptaddr}; reset`

The default bootcmd loads a script called "boot.scr" from the root of the first partition (which also contains the U-boot environment as a file called `uboot.env`).

# Building U-Boot

## Get the source
 
 - U-Boot: https://github.com/renzenicolai/uboot-pine64-clusterboard
 - ARM trusted firmware: https://github.com/ARM-software/arm-trusted-firmware
 - Coprocessor firmware: https://github.com/crust-firmware/crust

## Build the ARM trusted firmware

`make CROSS_COMPILE=aarch64-linux-gnu- PLAT=sun50i_a64 DEBUG=1 bl31`

## Build the coprocessor firmware

Note: including the coprocessor firmware causes reboot issues, skip this step for now.

```
make CROSS_COMPILE=or1k-elf- pine64_plus_defconfig
make CROSS_COMPILE=or1k-elf- scp
```

## Select the correct configuration

`make CROSS_COMPILE=aarch64-linux-gnu- sopine_baseboard_defconfig`

## Build U-Boot

### Building without the SCP firmware (recommended for now):

Assuming the `bl31.bin` ARM trusted firmware is in the parent folder:

`make CROSS_COMPILE=aarch64-linux-gnu- BL31=../bl31.bin -j4`

U-boot will give a warning about the missing SCP blob, you can ignore this.

### Building with the SCP firmware (reboot won't work!):

Assuming the `bl31.bin` ARM trusted firmware and the `scp.bin` coprocessor firmware are in the parent folder:

`make CROSS_COMPILE=aarch64-linux-gnu- BL31=../bl31.bin SCP=../scp.bin -j4`
