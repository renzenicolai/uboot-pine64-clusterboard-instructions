# Booting a sopine module from SPI flash

The included configuration stores it's environment on the SPI flash.

## Partitioning and writing to the SPI flash

First install the `mtd-utils` package, then run the following commands:

```
sudo mtdpart add /dev/mtd0 "U-Boot" 0 0xc0000
sudo mtdpart add /dev/mtd0 "Env" 0xc0000 0xc0000
sudo flash_erase /dev/mtd1 0 1
sudo flashcp u-boot-sunxi-with-spl.bin /dev/mtd1
```

## Default boot command

`setenv boot_targets "usb0 pxe dhcp";run distro_bootcmd`

This boot command will try to load an OS from an attached USB mass storage device or from the network.

Saving the environment to the SPI flash chip using `saveenv` works, but I haven't played with this further yet.

The default environment does load the PXE boot menu my PXE server presents over the network.

You can view the environment using `printenv`, there is a lot of stuff in there so when looking at the boot process keep in mind that the first command executed is the `bootcmd`.