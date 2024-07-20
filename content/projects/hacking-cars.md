--- 
title: "Hacking Cars"
date: 11-5-2018
---

> [!tip] 
>
> Check out the original post [here](https://hackaday.io/project/164566-how-to-hack-a-car)

After reading [this](https://www.wired.com/2015/08/hackers-tiny-device-unlocks-cars-opens-garages/) article about Samy Kamkar's rolljam project (a $32 device which can perform an attack against rolling code systems used in car keyfobs) I quickly became obsessed with the idea of hacking cars and I was amazed by how simple his attack was to perform. After watching _many_ DEFCON talks and researching quite a bit, I finally felt ready to try it out myself.

Note: I completed this project around two years ago, and I never really thought about uploading it to my hackaday page until now. 

# Keyless Entry Systems

Most car manufacturers nowadays use a keyless entry system called rolling codes. This was put into place to prevent replay attacks, in which the attacker captures the unlock signal produced by the keyfob, and replays it to the car later. The rolling code system relies on an algorithm which produces a new code every time the keyfob is pressed, and the next code in the sequence can only be predicted by the car and the keyfob (this means that even if an attacker manages to capture one of the codes, that code immediately gets classified as expired since both the car and the keyfob have moved onto the next code in the sequence). 

The data is transmitted from the keyfob to the car over radio (usually within the ISM band - radio bands reserved internationally for industrial, scientific and medical purposes instead of telecommunications). At the most basic level, this data is usually modulated using on-off keying (OOK) in which binary bits are transmitted one by one (a high power level for a one, and a low power level for a zero). Since keyfobs don't have to transmit large amounts of data, the data rate (or baud rate) is pretty low (meaning each binary bit lasts longer). This means that these signals can be easily received and decoded with just a few lines of python.

<center>
<img src="attachments/projects/hacking-cars/1.png" width="40%">
</center>

In my case, the keyfob data was modulated using Frequency Shift Keying (FSK), a more complex modulation method in which frequency is changed instead of power level. In the end, you pretty much achieve the same result.  

# Samy Kamkar's Rolljam 

To learn about his method in more detail, I recommend you watch his DEF CON talk "Drive it like you hacked it" [here](https://www.youtube.com/watch?v=UNgvShN4USU). In a nutshell, his method relies on blocking the initial signal before it's received by the car. This means that the code the attacker received hasn't "expired" yet since the car still hasn't moved onto the next code in the sequence. However, since the car doesn't receive this signal, it doesn't unlock. But what would someone do when their car key doesn't work? Press the button again. The second time the button is pressed, the second signal is also blocked, stored, and then the first code is replayed to the car. Now, the attacker is one code ahead in the sequence, and can use the stored code later.

Here's a screenshot from Samy's presentation:

<center>
<img src="attachments/projects/hacking-cars/2.png" width="80%">
</center>

# Acquiring the Signal

For this attack, I used a [YARD Stick one](https://greatscottgadgets.com/yardstickone/) (YS1) and an RTL-SDR for receiving/transmitting any data. I used a GNURadio flow graph with the RTL-SDR to receive and decode the keyfob data, and RfCat with YS1 for transmitting the data. Yes, I know I didn't have to use GNURadio or an RTL-SDR for this, but I only have one YS1, and since i'm using it for jamming, I need a way to receive data while jamming.

First of all, I had to find the frequency the keyfob was operating at. To do that, I used GQRX and the RTL-SDR:

<center>
<img src="attachments/projects/hacking-cars/3.gif" width="80%">
</center>

Here, we see two spikes. This indicates that the type of modulation being used is FSK, at around 868MHz. 

This the GNURadio flow graph:

<center>
<img src="attachments/projects/hacking-cars/4.png" width="80%">
</center>

The output is simply raw data, that is then processed by my python script to obtain hex values for every piece of the data. (I did this so long ago that I can't even remember what most of these blocks actually do, so if you want to figure that out, go ahead).

When the keyfob is pressed, this is what the GNURadio output looks like:


<center>
<img src="attachments/projects/hacking-cars/5.gif" width="80%">
</center>

The flow graph also contains a tagged file sink, which contains raw digital data. However, to convert this to a nice stream of binary bits, we need to figure out the right baud rate. I found [this](https://www.youtube.com/watch?v=rQkBDMeODHc) talk by Michael Ossmann, where he talks about a script he wrote which automatically syncs to the right clock frequency, allowing us to decode the data very nicely.

Once I got to this point, I've pretty much done most  of the work. 

# Executing the Attack

The code actually consists of two scripts, one which runs the GNURadio flowgraph, constantly spitting out any data which is received, and another which handles the actual attack and decoding the data. 

Heres a GIF of me testing the code for the first time.

<center>
<img src="attachments/projects/hacking-cars/6.gif" width="80%">
</center>

  
Samy is my hero.