# Settings

setenv board_name sopine-clusterboard
setenv devtype mmc
setenv devnum 0
setenv bootpart 2

# Script

part uuid ${devtype} ${devnum}:${bootpart} uuid

setenv bootargs console=${console} root=PARTUUID=${uuid} rw rootwait

if load ${devtype} ${devnum}:${bootpart} ${kernel_addr_r} /boot/Image; then
  setenv fdtfile allwinner/sun50i-a64-${board_name}.dtb
  if load ${devtype} ${devnum}:${bootpart} ${fdt_addr_r} /boot/dtbs/${fdtfile}; then
    if load ${devtype} ${devnum}:${bootpart} ${ramdisk_addr_r} /boot/initramfs-linux.img; then
      booti ${kernel_addr_r} ${ramdisk_addr_r}:${filesize} ${fdt_addr_r};
    else
      booti ${kernel_addr_r} - ${fdt_addr_r};
    fi;
  fi;
fi
