My Strikingly Interview Result
==============================

这是Strikingly Interview Test中的两道题，个人获益良多，与大家分享

##Task 2: JavaScript Programming Test

###题目要求

用JavaScript写一个程序，使之可以自动玩Hangman Game(游戏介绍见[Wikipedia](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0CCoQFjAA&url=%68%74%74%70%3a%2f%2f%65%6e%2e%77%69%6b%69%70%65%64%69%61%2e%6f%72%67%2f%77%69%6b%69%2f%48%61%6e%67%6d%61%6e%5f%28%67%61%6d%65%29&ei=_LFxU4T3BMP88QWNrIKgAg&usg=AFQjCNENObp8BVLOXL9i7bQkgzI_d9kojw&sig2=hqJ3A7rKUS_PFMVOkECWbg&bvm=bv.66330100,d.dGc))

Strikingly在服务器上设计了一个Hangman Game，用户需要向Hangman Game服务器提供的REST API发出请求来玩这个游戏

[点击这里](https://github.com/joycehan/strikingly-interview-test-instructions)可以看到Strikingly提供的游戏指导信息

Strikingly要求游戏流程如下：

1. Initialize the game with an API call and get the secret key
2. After getting the secret key, 

###思路

可以先看一下这个链接：

[http://datagenetics.com/blog/april12012/index.html](http://datagenetics.com/blog/april12012/index.html)

这篇文章给了我很大帮助

我一共写了两个版本：

* Version 1，这个版本用于浏览器的JavaScript Console
* Version 2，这个版本用Node.js编写
* Version 3，这个版本也用Node.js编写，但是程序本身拥有学习能力

前两个版本的思路大致都一样

第三个版本需要时间来学习，以达到提高猜对单词个数、降低猜错次数的目的，但是学习效率太低

###收获

1. 更加了解JavaScript异步编程
2. 大量数据很重要，分析数据更重要
3. ...

##Task 3: HTML/CSS

###题目要求

从Dribbble上找来一张[图](http://dribbble.s3.amazonaws.com/users/329582/screenshots/1180492/slide-59.jpg)，见下

用HTML/CSS来实现这张图片，字体要求从Google Fonts选取

![From Dribbble](http://dribbble.s3.amazonaws.com/users/329582/screenshots/1180492/slide-59.jpg "Task 3")

###效果图

我用的是Josefin Sans字体，在HTML代码中需要加上如下代码：

`<link href='http://fonts.googleapis.com/css?family=Josefin+Sans:100,300,400,600,700' rel='stylesheet' type='text/css'>`

并在CSS中设置：

`font-family: 'Josefin Sans', sans-serif;`

![By h1994st](https://raw.githubusercontent.com/h1994st/My-Strikingly-Interview-Result/master/TASK3/result.png)

###思路

1. 将图片下载下来
2. 对图片分块，用HTML代码写出大致框架
3. 用图像处理软件(例如Photoshop)打开 (当然，如果你觉得肉眼够厉害，那就不用这一步了......)
4. 将图片放大到像素级别(有点强迫症的感觉......)
5. 一点点抠细节，完成CSS代码

###收获

1. CSS中`transprant`这个属性在不同浏览器中表现并不一样，在Chrome中实际上是`rgba(255, 255, 255, 0)`，在Firefox中则是`rgba(0, 0, 0, 0)`，这一点可以通过渐变体现出来，如下代码`linear-gradient(rgba(255, 255, 255, .85), transparent)`可以清晰看到这一点
2. 



