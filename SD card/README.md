# Booting a sopine module from SD card

The included configuration stores it's environment on the first partition of the SD card, which is expected to be formatted as EXT4.

## Partition table

You can use fdisk to format the SD card, simply run

`fdisk /dev/sdX`

Enter `o` (to create a DOS partition table) followed by `n`. Set the first sector to 4096, then enter the size of the boot/environment partition (can be done as +128M for an 128MB partition).

Then enter `p` to print the table, followed by `n`. Set the first sector to the "end" sector of the first partition plus 1. Then hit enter twice to have the partition take up the rest of the SD card.

## Flashing the bootloader

`sudo dd if=u-boot-sunxi-with-spl.bin of=/dev/sdX bs=8k seek=1`

## Environment

I recommend creating a separate partition for storing the environment, you can do this using the following command:

`sudo mkfs.ext4 -O "^metadata_csum,^64bit" /dev/sdXp1`

This will format the first partition of SD card mmcblk0 as EXT4 with the options that U-boot does not support disabled.
Pleae check the path of the partition device before running this command before running it.

When saved using `saveenv` the environment will be stored as a file called `uboot.env` in the first partition of the card.

## Default boot command

`load mmc 0:1 ${scriptaddr} /boot.scr; source ${scriptaddr}; reset`

The default bootcmd loads a script called "boot.scr" from the root of the first partition (which also contains the U-boot environment as a file called `uboot.env`).

## Settings for booting using the Arch Linux ARM boot.scr file for Pine64

```
setenv board sopine-baseboard
setenv board_name sopine-baseboard
setenv devtype mmc
setenv devnum 0
setenv bootpart 2
setenv bootcmd "load mmc 0:1 ${scriptaddr} /boot.scr; source ${scriptaddr}; reset"
saveenv
```

## GIT hash of version used to build the binary

`v2020.07-999-g56d37f1c56`

`95fc1f164723270b2b0bd8d7e2f7ba21bce66381`