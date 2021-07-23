# RTL8370N research

The Pine64 Clusterboard has a supposedly unmanaged switch, but the chip used (RTL8370N) is in fact a managed mode capable switch chip.

The Clusterboard does not contain the flash chip that would contain the firmware for the ethernet switch in a managed configuration, however there is an EEPROM chip (24C08) that contains register settings for the ethernet switch which get loaded in after the ethernet switch chip is reset.

## EEPROM wiring
The EEPROM is only connected to the RTL8370N, to allow us to read and write the EEPROM some modifications to the Clusterboard are needed.

| EEPROM chip pin | SoPine module #0 pin     |
|-----------------|--------------------------|
| 5 (SDA)         | 20 (SDA_A / PH3-TW1_SDA) |
| 6 (SCK)         | 19 (SCK_A / PH2-TW1_SCK) |
| 7 (WP)          | 18 (GND)                 |

Connecting WP to GND disables the write protection, if you want to play around without risk of overwriting the EEPROMs contents leave the WP pin disconnected, it has a pullup resistor of 4.7k (which will leave the EEPROM write protected).

## Device tree
In the devicetree enable I2C bus 1 (i2c1 or /soc/i2c@1c2b000) by setting `status = "okay";` on the devicetree entry.

## Loading the EEPROM Linux driver

The EEPROM entry could be added to the device tree, however another simple method can be used for quickly adding the device during runtime:

You can test if the EEPROM shows up on the i2c bus by running `i2cdetect 1 0x050 0x53` as root. This program is included with the `i2c-tools` package.

You should see the following output:

```
# i2cdetect 1 0x050 0x53
WARNING! This program can confuse your I2C bus, cause data loss and worse!
I will probe file /dev/i2c-1.
I will probe address range 0x50-0x53.
Continue? [Y/n] y
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                                                 
10:                                                 
20:                                                 
30:                                                 
40:                                                 
50: 50 51 52 53                                     
60:                                                 
70:
```

You can now load the EEPROM driver by running the following commands:

```
modprobe i2c:24c08
echo 24c08 0x50 > /sys/bus/i2c/devices/i2c-1/new_device
```

## Reading and writing

Now that the EEPROM driver is loaded you can read and write the eeprom by reading from and writing to the file `/sys/bus/i2c/devices/i2c-1/1-0050/eeprom`.

Reading:
```
cat /sys/bus/i2c/devices/i2c-1/1-0050/eeprom > eeprom.bin
```

Writing:
```
cat eeprom.bin > /sys/bus/i2c/devices/i2c-1/1-0050/eeprom
```

# EEPROM contents

The contents of the EEPROM can be found in `eeprom.bin` in this repository.

## Understanding the file contents

Some register documentation can be found online ([rtl8370_reg.h](https://github.com/andy-padavan/rt-n56u/blob/master/uboot/mips/uboot-5.x.x.x/drivers/rtl8367/api_8370/rtl8370_reg.h)).

The EEPROM seems to contain information ordered in 16-bit words. The meaning of the first word is unknown to me, but from the second word on the contents appear to be organized as 1 word for the register address and 1 word for the data to be written to said address.

### What's in the file?

I've made a small parser script that translates the EEPROM contents into a table. The contents of the EEPROM on my Clusterboard translate to the following register writes:

| Address | Register name                            | Value |
|---------|------------------------------------------|-------|
|    1B26 | SCAN0_LED_IO_EN                          |     0 |
|    1B27 | SCAN1_LED_IO_EN                          |     0 |
|    133F | MDX_PHY_REG1                             |    30 |
|    133E | MDX_PHY_REG0                             |     E |
|    221F |                                          |     5 |
|    2201 |                                          |   700 |
|    2205 |                                          |  8B82 |
|    2206 |                                          |   5CB |
|    221F |                                          |     2 |
|    2204 |                                          |  80C2 |
|    2205 |                                          |   938 |
|    221F |                                          |     3 |
|    2212 |                                          |  C4D2 |
|    220D |                                          |   207 |
|    221F |                                          |     1 |
|    2207 |                                          |  267E |
|    221C |                                          |  E5F7 |
|    221B |                                          |   424 |
|    221F |                                          |     5 |
|    2205 |                                          |  FFF6 |
|    2206 |                                          |    80 |
|    2205 |                                          |  8000 |
|    2206 |                                          |  F8E0 |
|    2206 |                                          |  E000 |
|    2206 |                                          |  E1E0 |
|    2206 |                                          |   1AC |
|    2206 |                                          |  2408 |
|    2206 |                                          |  E08B |
|    2206 |                                          |  84F7 |
|    2206 |                                          |  20E4 |
|    2206 |                                          |  8B84 |
|    2206 |                                          |  FC05 |
|    2205 |                                          |  8B90 |
|    2206 |                                          |  8000 |
|    2205 |                                          |  8B92 |
|    2206 |                                          |  8000 |
|    2208 |                                          |  FFFA |
|    2202 |                                          |  3265 |
|    2205 |                                          |  FFF6 |
|    2206 |                                          |    F3 |
|    221F |                                          |     0 |
|    221F |                                          |     7 |
|    221E |                                          |    42 |
|    2218 |                                          |     0 |
|    221E |                                          |    2D |
|    2218 |                                          |  F010 |
|    221F |                                          |     0 |
|    133F | MDX_PHY_REG1                             |    10 |
|    133E | MDX_PHY_REG0                             |   FFE |
|    207F |                                          |     2 |
|    2079 |                                          |   200 |
|    207F |                                          |     0 |
|    1203 | INBW_LBOUND_L                            |  FF00 |
|    1200 | MAX_LENGTH_LIMINT_IPG                    |  7FC4 |
|    121D | FLOWCTRL_CTRL0                           |  FC16 |
|    121E | FLOWCTRL_ALL_ON                          |   7E0 |
|    121F | FLOWCTRL_SYS_ON                          |   4B9 |
|    1220 | FLOWCTRL_SYS_OFF                         |   495 |
|    1221 | FLOWCTRL_SHARE_ON                        |   4A1 |
|    1222 | FLOWCTRL_SHARE_OFF                       |   47D |
|    1223 | FLOWCTRL_FCOFF_SYS_ON                    |   4B9 |
|    1224 | FLOWCTRL_FCOFF_SYS_OFF                   |   495 |
|    1225 | FLOWCTRL_FCOFF_SHARE_ON                  |   4A1 |
|    1226 | FLOWCTRL_FCOFF_SHARE_OFF                 |   47D |
|    1227 | FLOWCTRL_PORT_ON                         |   144 |
|    1228 | FLOWCTRL_PORT_OFF                        |   138 |
|    122F | FLOWCTRL_FCOFF_PORT_ON                   |   144 |
|    1230 | FLOWCTRL_FCOFF_PORT_OFF                  |   138 |
|    1229 | FLOWCTRL_PORT_PRIVATE_ON                 |    20 |
|    122A | FLOWCTRL_PORT_PRIVATE_OFF                |     C |
|    1231 | FLOWCTRL_FCOFF_PORT_PRIVATE_ON           |    30 |
|    1232 | FLOWCTRL_FCOFF_PORT_PRIVATE_OFF          |    24 |
|     219 | FLOWCTRL_QUEUE_GAP                       |    18 |
|     200 | FLOWCTRL_QUEUE0_DROP_ON                  |    20 |
|     201 | FLOWCTRL_QUEUE1_DROP_ON                  |    4C |
|     202 | FLOWCTRL_QUEUE2_DROP_ON                  |    4C |
|     203 | FLOWCTRL_QUEUE3_DROP_ON                  |    4C |
|     204 | FLOWCTRL_QUEUE4_DROP_ON                  |    4C |
|     205 | FLOWCTRL_QUEUE5_DROP_ON                  |    4C |
|     206 | FLOWCTRL_QUEUE6_DROP_ON                  |    4C |
|     207 | FLOWCTRL_QUEUE7_DROP_ON                  |    4C |
|     218 | FLOWCTRL_PORT_GAP                        |    32 |
|     208 | FLOWCTRL_PORT0_DROP_ON                   |   7D0 |
|     209 | FLOWCTRL_PORT1_DROP_ON                   |   7D0 |
|     20A | FLOWCTRL_PORT2_DROP_ON                   |   7D0 |
|     20B | FLOWCTRL_PORT3_DROP_ON                   |   7D0 |
|     20C | FLOWCTRL_PORT4_DROP_ON                   |   7D0 |
|     20D | FLOWCTRL_PORT5_DROP_ON                   |   7D0 |
|     20E | FLOWCTRL_PORT6_DROP_ON                   |   7D0 |
|     20F | FLOWCTRL_PORT7_DROP_ON                   |   7D0 |
|     210 | FLOWCTRL_PORT8_DROP_ON                   |   7D0 |
|     211 | FLOWCTRL_PORT9_DROP_ON                   |   7D0 |
|     212 | FLOWCTRL_PORT10_DROP_ON                  |   7D0 |
|     213 | FLOWCTRL_PORT11_DROP_ON                  |   7D0 |
|     214 | FLOWCTRL_PORT12_DROP_ON                  |   7D0 |
|     215 | FLOWCTRL_PORT13_DROP_ON                  |   7D0 |
|     216 | FLOWCTRL_PORT14_DROP_ON                  |   7D0 |
|     217 | FLOWCTRL_PORT15_DROP_ON                  |   7D0 |
|     900 | QOS_PORT_QUEUE_NUMBER_CTRL0              |     0 |
|     901 | QOS_PORT_QUEUE_NUMBER_CTRL1              |     0 |
|     902 | QOS_PORT_QUEUE_NUMBER_CTRL2              |     0 |
|     903 | QOS_PORT_QUEUE_NUMBER_CTRL3              |     0 |
|     865 | QOS_1Q_PRIORITY_REMAPPING_CTRL0          |  3210 |
|     866 | QOS_1Q_PRIORITY_REMAPPING_CTRL1          |  7654 |
|     87B | QOS_INTERNAL_PRIORITY_DECISION_CTRL0     |     0 |
|     87C | QOS_INTERNAL_PRIORITY_DECISION_CTRL1     |  FF00 |
|     87D | QOS_INTERNAL_PRIORITY_DECISION_CTRL2     |     0 |
|     87E | QOS_INTERNAL_PRIORITY_DECISION_CTRL3     |     0 |
|     801 | RMA_CTRL01                               |   100 |
|     802 | RMA_CTRL02                               |   100 |
|     A20 | LUT_PORT0_LEARN_LIMITNO                  |  2040 |
|     A21 | LUT_PORT1_LEARN_LIMITNO                  |  2040 |
|     A22 | LUT_PORT2_LEARN_LIMITNO                  |  2040 |
|     A23 | LUT_PORT3_LEARN_LIMITNO                  |  2040 |
|     A24 | LUT_PORT4_LEARN_LIMITNO                  |  2040 |
|     A25 | LUT_PORT5_LEARN_LIMITNO                  |  2040 |
|     A26 | LUT_PORT6_LEARN_LIMITNO                  |  2040 |
|     A27 | LUT_PORT7_LEARN_LIMITNO                  |  2040 |
|     A28 | LUT_PORT8_LEARN_LIMITNO                  |  2040 |
|     A29 | LUT_PORT9_LEARN_LIMITNO                  |  2040 |
|    1B03 | LED_CONFIGURATION                        |     2 |

The VLAN registers can also be found inside the register map, I suspect it might be possible to configure VLANs on the switch chip by appending extra register writes to the EEPROM and resetting the ethernet switch chip.

## Resetting the switch chip

Connect the trace between R24 and C28 to a GPIO pin, pulling this pin low will put the ethernet switch chip into reset state. R24 and C28 can be found directly below the EEPROM chip.
