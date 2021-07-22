# Booting a sopine module from SPI flash

The included configuration stores it's environment on the SPI flash.

## Partitioning and writing to the SPI flash from Linux

First install the `mtd-utils` package, then run the following commands:

```
sudo mtdpart add /dev/mtd0 "U-Boot" 0 0xc0000
sudo mtdpart add /dev/mtd0 "Env" 0xc0000 0xc0000
sudo flash_erase /dev/mtd1 0 1
sudo flashcp u-boot-sunxi-with-spl.bin /dev/mtd1
```

## Writing to the SPI flash from U-boot

```
sf probe 0
load mmc 0:1 ${kernel_addr_r} u-boot-sunxi-with-spl.bin
sf erase 0 +${filesize}
sf write ${kernel_addr_r} 0 ${filesize}
```

## Default boot command

`setenv boot_targets "usb0 pxe dhcp";run distro_bootcmd`

This boot command will try to load an OS from an attached USB mass storage device or from the network.

Saving the environment to the SPI flash chip using `saveenv` works, but I haven't played with this further yet.

The default environment does load the PXE boot menu my PXE server presents over the network.

You can view the environment using `printenv`, there is a lot of stuff in there so when looking at the boot process keep in mind that the first command executed is the `bootcmd`.

# Building U-Boot

## Get the source
 
 - U-Boot: https://github.com/renzenicolai/uboot-pine64-clusterboard
 - ARM trusted firmware: https://github.com/ARM-software/arm-trusted-firmware
 - Coprocessor firmware: https://github.com/crust-firmware/crust

## Build the ARM trusted firmware

`make CROSS_COMPILE=aarch64-linux-gnu- PLAT=sun50i_a64 DEBUG=1 bl31`

## Build the coprocessor firmware

```
make CROSS_COMPILE=or1k-elf- pine64_plus_defconfig
make CROSS_COMPILE=or1k-elf- scp
```

## Select the correct configuration

`make CROSS_COMPILE=aarch64-linux-gnu- sopine_baseboard_spi_defconfig`

## Build U-Boot

Assuming the `bl31.bin` ARM trusted firmware and the `scp.bin` coprocessor firmware are in the parent folder:

`make CROSS_COMPILE=aarch64-linux-gnu- BL31=../bl31.bin SCP=../scp.bin -j4`
