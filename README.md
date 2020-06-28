## 一、TBL语言



### 1.1 公式运行机制

TBL语言是基于TBQuant金融量化平台的一种专用计算机语言。其语法简洁易懂，介于C++与Pascal之间。其程序语言可以由多重数学、布尔值的计算以及逻辑判断等组成。TB公式属于编译型公式，即只有通过编译的公式程序方可被应用于图表，这样使得公式的执行更有效率。

TBQuant作为一款金融量化的软件，针对金融市场的数据特性，它提供了很多使用方便的机制用于金融量化交易。针对金融时间序列数据的特性，从TB软件最初的begin/end的机制，到现在的onbar等事件驱动机制，这都给时间序列建模提供了极大方便。而TBQuant的多品种多周期的自动对齐机制，使得对截面数据的处理也变得方便高效。

下面我们介绍下TBQuant的3个重要运行机制。

#### 单数据源的onbar机制

Onbar机制，就是之前产品的begin/end机制。当策略公式在onbar机制下运行时，公式进行计算时，都是建立在基本数据源“Bar数据”之上。这里所指的“Bar数据”是指商品在不同时间周期下形成的序列数据，在单独的每个Bar上面包含开盘价、最高价、最低价、收盘价、成交量、持仓量以及时间等信息数据。Bar数据也是我们口头上常说的K线数据。

##### 1）历史数据的运行机制：从左到右、从上到下

公式在计算时按照“Bar数据”的Bar数目，从左边第一个Bar依次执行到右边最后一个Bar，在单个Bar数据上的公式运算为从上到下完整执行公式中所有语句，即每次公式的运算都是从公式最上方的语句“参数的声明、变量的声明”开始直至公式的计算主体onbar{}(Begin至End)结束。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_001.png"  width="" />

如果所示，我们定义了一个全局变量，在第一根BAR初始值为0，然后其它BAR每次加1。

TBQuant的onbar机制从左边第一根BAR开始运行公式一次，公式代码的运行则从上到下依次执行。然后第二根BAR运行公式num变为1,然后第三根BAR运行公式，直到倒数第二根BAR（第14根BAR）运行结束，num累计为13。

##### 2）实时行情的运行机制：每个TICK运行一次

对于实时数据，每当有新的Tick进来，公式都会在当前Bar上对新数据执行一次完整的运算。比如如果上图中的公式在2019/7/19的交易时间运行，那么每来一个新的TICK，公式会从上到下执行依次，num会累加1。盘中在2019/7/19这根bar上num的数值会不断累计变化。如果当天有100个TICK，则num在2019/7/19这根BAR结束时会总共累加100次。最后num的数值会变成113。

注意：若当前公式所应用的合约交易非常活跃并且公式程序较长、计算较复杂时，当前Tick到来之后与下一个Tick到来之前的这段时间之内，可能无法完成公式代码完整执行一遍的计算。 此时，虽然新的Tick到来，但是不会触发公式的重新运行，依然继续执行之前的计算直至代码的最后一行。 之后，当最新的Tick到来时，才会再次触发新一轮的公式运算。也就是说，在这种情况下，不是Bar中每一个Tick到来时都触发公式重新计算一次。下表列出了历史回测和实时交易的区别。

|          | 历史回测     | 实时交易             |
| -------- | ------------ | -------------------- |
| Bar数据  | 确定不变     | 实时更新             |
| 公式运行 | 每根Bar一次  | 每个Tick一次         |
| 交易信号 | 固定不变     | 有可能变化           |
| 是否发单 | 否           | 是（受公式机制控制） |
| 函数调用 | 部分函数无效 | 有效                 |

#### 多数据源的onbar机制

Onbar在多数据源上的运行的机制虽然基本特征依旧满足单数据源的onbar机制的特征：1、历史数据是从左到右从上到下的运行。2、实时行情每个tick驱动一次。但是多数据要比在一个数据源上的机制复杂，需要考虑各个数据源的时间问题，这里面既有不同周期的数据对齐，也有不同交易时间的特殊处理。

这里我们重点讲解多数据源onbar机制的4个方面：1、数据的对齐机制 ；2、数据的编号；3、公式的运行机制；4、特殊情况的补充机制。

##### 1）数据的对齐机制 

关于多数据源的对齐机制我们在本文开始的章节已有介绍，重点在于总时间坐标的确定，这里不再复述。需要注意的是各数据源的最后一根BAR肯定是对齐在一起的。

##### 2）数据源的编号

当有多个数据源时，系统会给这些数据源进行编号，编号从0依次累加。如果总共有三个合约，那么三个数据源的序号是0，1，2。如果需要调用相应数据源的数据或者公式运算，则直接用data[i].的前缀就可以调用第i+1个（因为编号从0开始）数据源的数据或者公式运算。

##### 3）公式运行的机制 

###### 3.1）公式运行机制的建立：在每个数据源上建立局部变量的备份

当只有一个数据源时，公式依赖于data0这唯一的数据源运行。这体现在除了全局变量其余的局部变量都是依赖于data0的数据源的。

当有多个数据源时，公式会在每个数据源都建立一套机制，对应的除了全局变量其余的局部变量在每个数据源都有自己独立的存在。

比如公式定义一个普通的数值变量numeric num(0); 如果公式应用于有三个数据源的交易单元，则实际上存在三个独立的num，分别是data0.num,data1.num,data2.num。

###### 3.2）多数据源的运行机制什么时候被触发？

对于历史数据，公式会每个总时间坐标上运行一次。

对于实盘数据，任何一个数据源的tick更新都会触发公式运行一次。运行的数据源是基于每个数据源上的最后一根BAR。但是公式执行过程中，如有多次更新会合并触发下一次运行。

比如下面的例子：数据和代码分别如下：

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_002.png"  width="" />

~~~ cpp
if (Data0. Open - Data1. Open) >10    （1）
{
    Data0.Buy(1, Open);               （2）
    Data1.Sellshort(1, Open);          (3)
}      
~~~

a) 对于历史数据，公式会在每个时间坐标（9:00，9:02，9:03  9:04，9:06）上都会运行一次。上述公式运行时，每条语句的执行情况如下表所示：

| 时间坐标 | （1）执行 | (2) 执行 | (3) 执行 |
| -------- | --------- | -------- | -------- |
| 9:00     | √         | √        |          |
| 9:02     | √         |          | √        |
| 9:03     | √         | √        |          |
| 9:04     | √         |          | √        |
| 9:06     | √         | √        | √        |

b) 对于实时数据，上述公式运行时，每条语句的执行情况如下表所示：

| 新tick | （1）执行 | (2) 执行 | (3) 执行 |
| ------ | --------- | -------- | -------- |
| Data0  | √         | √        |          |
| Data1  | √         |          | √        |

各数据源在计算指标时不补缺失的数据，直接取最原始的数据进行计算。

如Data0.var1 = Data1.averageFC(Close，10)，取Data1最近10根有效的bar的Close计算均价。

（注：通过Commentary，在相应数据源的输出，会合并输出，如在30Min(Data[0])输出15Min(Data[1])，会有相应的两次输出）

##### 3.3）哪些代码会在哪个数据源上被执行

Onbar{}之间的代码在那个数据源上运行则依赖range[i:j]和data[i].这两个机制控制。Range和data中的下标i与数据源的编号对应。

###### 3.3.1）data[i].对单条代码运行的控制

Data[i].可以加在局部变量前面，这代表这个局部变量是属于data[i]的那个局部变量；

Data[i].可以加在函数的前面，这代表这个函数运算只在data[i]上运行，函数中的局部变量如果没data[j]的前缀，都默认是data[i]的局部变量。

注意：

a) 没有加data[i].前缀的局部变量默认是data0的（除了data[i].函数中的局部变量）。

b) Data[i]和datai等价。

c) 没有指定数据源的函数系统默认添加数据源前缀Data0。

d) 函数入参可以是其它数据源的数据，如Data0.Average（Data1. Close，3）。

e) 函数入参不显示数据源则仍默认其数据源为父域，如Data1.Average（Close，3）中的Close指Data1. Close。

我们举例说明：

比如下面求均值的简单语句

| Code语句                                | Avg是哪个图层 | Average是那个图层 | Close是哪个图层 |
| --------------------------------------- | ------------- | ----------------- | --------------- |
| Avg=average(close,5);                   | Data0         | Data0             | Data0           |
| Avg=data1.average(close,5);             | Data0         | Data1             | Data1           |
| Avg=average(data1.close,5);             | Data0         | Data0             | Data1           |
| Avg=data1.average(data0.close,5);       | Data0         | Data1             | Data0           |
| Data1.Avg=average(close,5);             | Data1         | Data0             | Data0           |
| Data1.Avg=data1.average(close,5);       | Data1         | Data1             | Data1           |
| Data1.Avg=average(data1.close,5);       | Data1         | Data0             | Data1           |
| Data1.Avg=data1.average(data0.close,5); | Data1         | Data1             | Data0           |

###### 3.3.2）RANGE对代码段的控制

~~~cpp
Range[i:j]
{
	代码段codes1；
}
~~~

如果使用range[i:j]把代码段codes1括起来，则代表这一段代码只在数据源datai到dataj的数据源运行。I要小于j,比如range[1:2]，则代表代码段codes1只在数据源data1和data2上运行。

具体例子如下：

~~~cpp
Range[0:1]
    {
        AvgValue1 = AverageFC(Close,FastLength);
        AvgValue2 = AverageFC(Close,SlowLength);
        PlotNumeric("MA1",AvgValue1);
        PlotNumeric("MA2",AvgValue2);        
    }
~~~

上面代码会在Data[0]和Data[1]上都运行，分别画出Data[0]和Data[1]的双均线。

注意：Range[i:j]内的代码运行说明如下：

a) 没有指定数据源的代码，依次在Data [i]到Data [j]的bar上运行。

b) 有指定数据源的代码，则在指定的数据源的bar上运行。

c) 同一个公式内，可有多个并列的Range代码块，Range内不支持Range嵌套。

d) Range[m:n]中，数据源起始位置m及结束位置n可以指定，也可以为变量和参数声明，类型为简单变量。

##### 3.4）特殊情况的处理机制

基于3.1）中所描述的数据对齐机制和3.2）中描述的实时行情的运行机制，会出现下列情况：一个有实时行情的数据源的TICK触发了一个处于非交易时间的数据源上的执行机制。比如data0是rb1910，data1是jd1909这样的两个数据源，如果处于夜盘交易时段，这就会发生rb1910的tick会驱动jd1909的执行机制运行。这时候运行机制需要做特别处理。

处理规则是：

当一个数据源的数据时间(rb1910的夜盘时段)已经不在另一个数据源的数据交易时间段时（比如jd1909没有夜盘），该数据源（rb1910）那就不能修改另一个数据源(jd1909)的信号、序列变量、commentery、plot、基础数据，即使修改也被忽略。

比如下面这个简单的例子：

~~~cpp
Events
OnBar(ArrayRef<Integer> indexs)
{	If(time==0.1455)
		Data1.buy(1,open);
}
~~~

如果加载在一个策略单元，这个策略单元第一个数据源是rb1910的5min，第二个数据源是jd1909的5min.那么夜盘时间rb1910的每一个根BAR在运行时都对应这jd1909的最后一根BAR，也就是14.55的那根BAR。

我们比较下特殊处理前后的执行过程。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_003.png"  width="" />

#### 事件驱动机制onorder等

为了满足交易策略的多样化，TBQuant扩展了onbar运行机制到事件驱动机制。事件驱动顾名思义就是以事件的发生驱动某些代码的执行。Onbar也是事件驱动的一种。这里简单介绍下事件驱动的基本类型和机制。事件驱动的详细介绍可以看学习资料的文档《事件驱动案例讲解》。

##### 1、事件驱动的基本类型

事件驱动基本类型有11种，这八种对应的基本特征如下表所示：

| 事件名称                                 | 调用语法                                                     | 基本解释                                                     |
| ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 初始化事件(OnInit)                       | OnInit() {   //用户初始化逻辑，主要用于创建各种数据源}       | 由策略执行前的初始化事件，只运行一次 只能依赖或使用Global等全局变量、全局设置信息 可以订阅数据，数据准备等操作 |
| 后初始化事件(OnReady)                    | OnReady() { //在所有的数据源准备完成后调用，应用在数据源的设置等操作} | 在策略执行前的初始化事件（数据源数据准确完成）之后，只运行一次 只能依赖或使用Global等全局变量、全局设置信息 可以对各个数据源进行相关设置 |
| Bar数据更新驱动(OnBar)                   | OnBar(Arrayref<Integer>indexs) {  //用户业务逻辑 }           | 当Bar更新变化时驱动，参数indexs表示更新的图层编号数组        |
| Bar数据开始驱动(OnBaropen)               | OnBaropen(ArrayRef <Integer> indexs){//用户业务逻辑 }        | 当Bar第一次生成时驱动，参数indexs表示更新的图层编号数组      |
| 持仓更新驱动(OnPosition)                 | OnPosition(PositionRef pos) {//用户业务逻辑}                 | 当持仓更新时驱动，参数pos表示更新的持仓结构体                |
| 委托更新驱动(OnOrder)                    | OnOrder(OrderRef ord) {//用户业务逻辑 }                      | 当委托更新时驱动，参数ord表示更新的委托结构体                |
| 成交更新驱动(OnFill)                     | OnFill(FillRef ordFill){   //用户业务逻辑}                   | 当成交更新时驱动，参数ordFill表示更新的成交结构体            |
| 定时器更新驱动(OnTimer)                  | OnTimer(Integer id,Integer millsecs){   //用户业务逻辑 }     | 当定时器更新时驱动，参数id表示定时器的编号，millsecs表示定时间的间隔毫秒值 |
| 策略账户持仓更新事件(OnStrategyPosition) | OnStrategyPosition(PositionRef pos) {   //用户业务逻辑 }     | 当策略账户仓更新驱动，策略账户仓是指本策略当日成交累计量，是一个相对持仓，参数pos表示持仓结构体 |
| 通用事件(OnEvent)                        | OnEvent(StringRef name,MapRef<String,String> evtValue) {   //用户业务逻辑 } | 当订阅了通用事件，有事件是驱动，参数name表示事件名称，evtValue表示事件内容 |
| 退出事件(OnExit)                         | OnExit() {   //用户业务逻辑}                                 | 当策略退出时驱动                                             |

##### 2、事件驱动的运行机制

事件驱动的整个结构运行的顺序是：

1、全局变量初始化。

2、oninit事件触发。在oninit事件中一般完成数据源的订阅、定时器的设置等操作。

3、数据源的准备。

4、普通变量初始化。

5、其它事件ontimer/onbar/onposition等的触发。

6、是否更改数据源。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_004.png"  width="750" />



#### 多公式组合策略在数据源上的运算

为了使用的方便，以及降低使用门槛，TB公式系统支持将现有的多个公式应用按照一定的顺序组合为一个交易策略。

交易策略执行时按照公式设置的顺序依次串行执行，公式间持仓共享，公式信号单独显示。


相当于把每个公式看成是一个函数，在交易策略内依次执行各个函数，整个策略共享一个MarketPosition。

TB提供了很多常用策略的公式应用代码，如交易策略进阶中的止盈止损、跟踪止损、收盘平仓、撤单、平仓延迟反手等。

用户可以根据需要将自己的公式组合TB提供的上述公式应用，形成一个完整的交易策略。

用户也可以将多个入场方式和出场方式分别写成单独的公式，然后根据需要将这些入场公式和出场公式按照一定的顺序组合成一个交易策略。实际执行中先满足条件的公式先执行。

示例：将下面的3个开仓条件和2个止损条件分别编写为5个独立的公式应用，并以下面的顺序组成一个策略。策略可以连续建仓，最大头寸为2。

公式1：收盘价大于上一根收盘价0.2%，下一根K线开盘开多仓1手

公式2：5、10日均线金叉开多仓1手

公式3：收盘价大于上一根K线最高价2跳，下一根K线开盘开多仓1手

公式4：低于上一根K线收盘价0.5%，多头全部平仓

公式5：5、10日均线死叉，多头全部平仓

分析：

上面3个开仓公式，任何2个先到达开仓条件，则由于仓位达到最大头寸2，另外一个开仓公式将不会执行。上面任何1个平仓公式达到平仓条件平掉所有的仓位，则另外一个平仓公式不会执行。	

实现：

1.编写上面5个公式应用的代码。

公式应用1：Average_Buy

~~~ cpp
Params
    Numeric percent(0.002); //大于收盘价幅度
Vars    
Events
    OnBar(ArrayRef<Integer> indexs)
    {
        If(CurrentContracts<2 && (Close[1] > Close[2] *(1 + percent)))
        {
            Buy(1,Open);
        }     
    }
~~~

公式应用2：Dual_Buy

~~~cpp
Params
    Numeric FastLength(5);
    Numeric SlowLength(20);
Vars
    Series<Numeric> AvgValue1; 
    Series<Numeric> AvgValue2;
Events
    OnBar(ArrayRef<Integer> indexs)
    {
        AvgValue1 = AverageFC(Close,FastLength);
        AvgValue2 = AverageFC(Close,SlowLength);
        PlotNumeric("MA1",AvgValue1);
        PlotNumeric("MA2",AvgValue2);        
        
        If(CurrentContracts<2 && AvgValue1[1] > AvgValue2[1])
        {
            Buy(1,Open);
        }    
    }
~~~

公式应用3： High_Buy

~~~cpp
Vars
    Numeric MinPoint;                  // 一个最小变动单位，也就是一跳
    Numeric MyEntryPrice;              // 开仓价格， 
    Numeric AddSet(2);                  // 大于最高价跳数
Events
    OnBar(ArrayRef<Integer> indexs)
    {  
        MinPoint = MinMove*PriceScale;
        If(CurrentContracts<2 &&  (Close[1] > High[2]  + AddSet*MinPoint))
        {
            Buy(1,Open);
        }        
    }
~~~

公式应用4：Average_Sell

~~~cpp
Params
    Numeric percent(0.005); //小于收盘价幅度
Vars    
Events
    OnBar(ArrayRef<Integer> indexs)
    { 
        If(MarketPosition==1 &&  (Low < Close[1] *(1 - percent)))
        {
            Sell(0, Min(Close[1] *(1 - percent),Open));
        }     
    }
~~~

公式应用5：Dual_Sell

~~~cpp
Params
    Numeric FastLength(5);
    Numeric SlowLength(20);
Vars
    Series<Numeric> AvgValue1; 
    Series<Numeric> AvgValue2;
Events
OnBar(ArrayRef<Integer> indexs)
{
    AvgValue1 = AverageFC(Close,FastLength);
    AvgValue2 = AverageFC(Close,SlowLength);
    PlotNumeric("MA1",AvgValue1);
    PlotNumeric("MA2",AvgValue2);        
    
    If(MarketPosition == 1 && AvgValue1[1] < AvgValue2[1])
    {
        Sell(0,Open);
    }
}
~~~

2.在程序化交易工作区，创建并设置策略单元，按照上面的顺序添加以上5个公式应用。

3.启动策略单元的程序化运行。

【注意】	

用户需注意实盘测试与历史测试不一致的情况。

如果公式4和公式5，在同一根BAR都能满足平仓条件。那么历史测试上因为公式顺序，先执行的是公式4。而实际情况中，可能是公式5的平仓条件先满足，而先执行了公式5。



### 1.2公式编码规则

#### 语言元素

交易开拓者公式平台的语言是TradeBlazer Language，简称“TB语言”。 它是一种高级语言，语法简洁易懂，介于C++与Pascal之间，其语言元素包括保留字、函数、表达式和语句。

保留字：TB公式中保留字有自己独特的意义或用途，主要是指一些功能关键字、系统函数以及数据类型等，例如：Params，Vars , For……

函数：函数实现一定的功能，分为系统函数和用户函数，例如：sqr，abs……

表达式：由变量和操作符组成的运算式，例如：x=a+b;

语句：赋值语句，分支语句，控制语句等等，例如：if…else语句

#### 命名规则

##### 1. 公式名称规则

不区分大小写；

不能超过64个英文字符；

公式之间不得重名；

公式名称不能出现字母、数字、下划线以外的其他字符，且不能以数字开头；

不能使用C++关键字；

公式名称不能和系统保留字，系统函数等重名。

##### 2. 变量，参数规则

不区分大小写；

不能超过64个英文字符；

每一个公式内部不能重复命名；

名称不能出现字母、数字、下划线以外的其他字符，且不能以数字开头；

名称不能和系统保留字，系统函数等重名；

不能使用C++关键字；

不能使用已定义的用户函数名。

#### 公式正文规则

公式中不区分字符的大小写，例如Ab与ab等效；

公式语句以“;”结束；

公式中代码正文不允许出现中文字符，使用英文双引号""引用起来的字符串除外；

公式正文字符因含义不同，以不同的颜色区分：

黑色 --- 用户自己声明的变量名或者参数名；

红色 --- 数字；

蓝色 --- 系统函数；

暗红色 --- 已有的用户函数；

紫红色 --- 运算符号；

果绿色 --- 字符串（可以为中文字符）；

翠绿色--- 注释语句（注释符号后可为中文字符）。

#### 注释方式

对单行语句进行注释，可以在句首使用“//”将该行文字注释，也可直接在公式语句之后使用 “// ”对语句的意思或者想要标记的内容注释；

对多行语句进行注释，则可使用“/* ...*/”将整段文字进行注释；

也可以使用快捷键Ctrl + B进行块注释；

使用快捷键Ctrl+U对选中行取消行注释，Ctrl+L对选中行添加行注释；

注释语句不参与公式主体的计算，允许出现中文字符。

#### 保留字

TB公式中保留字主要指功能关键字、系统函数以及数据类型等。命名公式简称以及参数、变量时，要避免使用保留字。

下面分类列举出系统主要的保留字。

##### 运算符

| 类型       | 保留字                |
| ---------- | --------------------- |
| 算术运算符 | + - * / % ^           |
| 关系运算符 | > >= < <= == != <>    |
| 逻辑运算符 | AND/&& OR/\|\| NOT/！ |

##### 功能关键字

| 保留字   | 说明                                                         |
| -------- | ------------------------------------------------------------ |
| Params   | 用该关键字宣告参数定义的起始，参数必须填写默认值。           |
| Vars     | 用该关键字宣告变量定义的起始(可以赋初值), 变量不填写初值时,系统将自动为其填充初值。 |
| If       | 条件语句。                                                   |
| Else     | 条件语句。                                                   |
| Begin    | 用该关键字宣告程序主体的起始。                               |
| End      | 用该关键字宣告程序主体的结束。                               |
| For      | 循环语句。                                                   |
| To       | 循环语句。                                                   |
| DownTo   | 循环语句。                                                   |
| While    | 循环语句。                                                   |
| Break    | 循环语句。                                                   |
| Continue | 循环语句。                                                   |
| True     | 真。                                                         |
| False    | 假。                                                         |
| Return   | 返回函数结果                                                 |

##### 数据源

| 保留字         | 说明                                                     |
| -------------- | -------------------------------------------------------- |
| Data0-Data99** | 支持多个数据源（具体数目及支持效率与本地电脑配置相关）。 |
| Data           | 数据源数组(格式为：Data[i]，i为整数，用法同上)。         |

##### 函数：数据输出和交易指令

| 保留字      | 说明                                    |
| ----------- | --------------------------------------- |
| PlotBool    | 输出布尔型值。                          |
| PlotNumeric | 输出数值型值。                          |
| PlotString  | 输出字符串值。                          |
| UnPlot      | 取消指定位置的输出。                    |
| PlotDic     | 在当前Bar的输出信息中添加基础数据信息。 |
| Alert       | 报警输出。                              |
| Buy         | 多头建仓操作。                          |
| Sell        | 多头平仓操作。                          |
| SellShort   | 空头建仓操作。                          |
| BuyToCover  | 空头平仓操作。                          |
| ...         | 其他系统函数。                          |

##### 标点符号

| 符号 | 名称   | 说明                                         |
| ---- | ------ | -------------------------------------------- |
| ;    | 分号   | 语句结束的标志。                             |
| ,    | 逗号   | 当函数带有多个参数时，用于分隔多个参数。     |
| ()   | 小括号 | 括号之内的表达式有计算的优先权。             |
| ""   | 双引号 | 字符串常量。                                 |
| []   | 中括号 | 回溯数据，引用以前的数据，或者数组中的元素。 |
| {}   | 大括号 | 控制语句的起始。                             |
| .    | 点     | 扩展数据源的数据调用。                       |

#### 操作符

操作符是象征具体操作运算行为的符号，根据其作用的不同，分为三类：

##### 数学操作符

| 操作符 | 说明 |
| ------ | ---- |
| +      | 加   |
| -      | 减   |
| *      | 乘   |
| /      | 除   |
| %      | 求模 |
| ()     | 括号 |

这些数学操作符按其特定的优先级来进行计算，“* ”(乘法)最先，其次是“/”(除法)和“%”(求模)，“+”(加法)和“-”(减法)最后，如果有多个乘法/除法(或者是加法/减法)，那么计算顺序是从左至右。

例：High+2* Range/2; 

它首先计算的是Range(此处Range是指High-Low)与2的积，接着计算与2的商(除法)，最后求2*Range/2与最高价(High)的和。

例： (High+Low)/2;

先计算()中High与Low的和，然后将计算得到的和值除以2，找到一个Bar的中间位置

##### 关系操作符

| 操作符 | 说明     |
| ------ | -------- |
| <      | 小于     |
| >      | 大于     |
| <=     | 小于等于 |
| >=     | 大于等于 |
| <>或!= | 不等于   |
| ==     | 等于     |

应用关系操作符，可以对两个数值或字符串表达式进行比较。

如果两个操作数都是数值型，则按其大小比较

如果两个操作数都是字符型，则按字符的ASCII码值从左到右一一比较

汉字字符大于西文字符

关系操作符的优先级相同

例：Close>High[1];

判断当前Bar收盘价是否比前一个Bar最高价高

例："abcd" < "zyxw";

字符串的比较运算中，按照顺序依次比较的每个字符的ASCII码值，直至计算出结果即可。 在这个例子中，首先比较“a”和“z”，字母"a"的ASCII值是小于"z"，所以该表达式的值为True。

##### 逻辑操作符

TB语言支持三类逻辑操作符：与AND(&&)，或OR(||)，非NOT(!)。

AND逻辑操作符运算规则：

| 表达式1 | 表达式2 | 表达式1 AND 表达式2 |
| ------- | ------- | ------------------- |
| True    | True    | True                |
| True    | False   | False               |
| False   | True    | False               |
| False   | False   | False               |

简单记忆法则：AND运算只有两个条件都为True时，结果才为True。

OR逻辑操作符运算规则：

| 表达式1 | 表达式2 | 表达式1 OR 表达式2 |
| ------- | ------- | ------------------ |
| True    | True    | True               |
| True    | False   | True               |
| False   | True    | True               |
| False   | False   | False              |

简单记忆法则：OR运算只要有一个条件为True，结果即为True。

NOT逻辑操作符运算规则：

| 表达式1 | NOT表达式1 |
| ------- | ---------- |
| True    | False      |
| False   | True       |

例：Low < Low[1] AND Close > High[1]; 

当前Bar的最低价小于前一个Bar的最低价，并且当前Bar的收盘价高于前一个Bar的最高价时，这个表达式的计算结果才为Ture。

例：High > 10 OR Vol > 5000;

当前Bar的最高价大于10，或者成交量大于5000，表达式的值都为True。

逻辑操作符的优先级低于数学操作符和关系操作符。逻辑操作符也遵循括号优先的原则，如果没有括号，那么其运算顺序是从左至右。因此逻辑表达式中不同条件的前后顺序，可能会产生不同的运算逻辑，执行的效率也会有所不同。

以Con1 AND Con2为例，系统从左到右进行逻辑判断，当Con1为True时，需要继续判断Con2是否为True，只有当Con1，Con2都为True时，整个表达式才为True。但是只要当Con1为False时，就不再需要判断Con2的值，而是直接返回False。

因此，以下两个表达式在执行效率方面是有差异的：

5 < 4 AND Close > Open; 

Close > Open AND 5 < 4;

第一条语句的执行速度大部分情况下都比第二条要快。

对于Con1 OR Con2表达式，情况也比较类似，当Con1为False时，需要继续判断Con2是否为False，只有当Con1，Con2都为False时，整个表达式才为False。但是只要当Con1为True时，就不再需要判断Con2的值，而是直接返回True。

以下两条语句的执行效率也是不一样的：

5 > 4 OR Close > Open;

Close > Open OR 5 > 4;

因此，逻辑表达式的组合应该尽可能地把容易判别整个表达式逻辑的条件放在前面，以减少整个表达式的计算时间。

#### 表达式

##### 表达式的组成

TB表达式由常量、变量、操作符、函数和圆括号按一定的规则组成，通过运算能得到结果，运算结果的类型由数据和操作符共同决定。

##### 表达式的书写规则

乘号不能省略。

括号必须成对出现，均使用圆括号，可以嵌套，但必须配对。

表达式从左到右在同一基准上书写，无高低、大小之分。

例：sqr((3* x+y)-z)/(x*y)^4 

##### 不同数据类型的转换

操作数的数据类型应该符合要求，不同的数据应该转换成同一类型。

例：Commentary("Close = "+Text(Close));

Commentary函数只能显示字符串类型的注释信息，因此，使用Text()函数将Close的数值转换成字符再显示

##### 优先级

同一表达式中，不同运算符的优先级是：

算术运算符 > 字符运算符 > 关系运算符 > 逻辑运算符

【注意】对于存在多种运算符的表达式，可增加圆括号改变优先级或使表达式更清晰。

例：MarketPosition == 1 And BarsSinceEntry >= 1

先进行关系运算MarketPosition是否等于1，BarsSinceEntry是否大于等于1；然后再根据逻辑运算符AND计算两个表达式的的结果（此条件的含义为是否持有多仓且不是开仓bar）

例：Low <= MyEntryPrice - StopLossSet* MinPoint


先计算StopLossSet* MinPoint，然后计算MyEntryPrice - StopLossSet* MinPoint，最后比较Low是否小于MyEntryPrice - StopLossSet*MinPoint（此条件的含义为判断止损条件是否满足）

#### 赋值语句

一个语句代表一个完全的指示或描述，语句中包含有保留字、操作符、符号。并且语句总是以";"作为语句结束的标志。

赋值语句用于给公式变量指定一个具体的值的语句，赋值语句使用赋值操作符(=)进行处理。

以下为赋值语句的一些例子：

~~~cpp
Vars
    Bool b;
Events
OnBar(ArrayRef<Integer> indexs)
{
    B = true;
    ...
}

Vars
    Numeric Value1;
Events
OnBar(ArrayRef<Integer> indexs)
{
    Value1 = (Close + Open)/2;
    ...
}

Vars
    String str;
Events
OnBar(ArrayRef<Integer> indexs)
{
    str ="It Is A Test!";
    ...
}
~~~

变量在赋值的时候忽略其扩展数据类型，只考虑其基本数据类型，即Series<Numeric>，NumericRef，Numeric之间可以相互赋值。此时序列数据类型只是对当前Bar的值进行操作。

以下的写法是错误的：

~~~cpp
Vars
    Series<Numeric> Value2;
Events
OnBar(ArrayRef<Integer> indexs)
{
    Value2[1] = (Close + Open)/2;
}	
~~~

#### 控制语句

计算机语言一般都有有三个基本的控制语句，顺序、选择和循环。

顺序类型直接以代码的顺序决定。选择类型和循环类型则需要有关键字来进行操作。

##### 一、选择类型

选择类型的关键字有if和else。

###### 1.1 一个分支

If(逻辑条件)

{

​	执行语句组；

}

注意：如果执行语句组只有一条语句时，{}可以省略。

举例：

~~~cpp
Vars
    Numeric a;
    Numeric b;
Events
OnBar(ArrayRef<Integer> indexs)
{
    if(a>0 and a<=1)
        b=1;
}
~~~

###### 1.2 两个互斥分支

If（逻辑条件）

{

​	执行语句组A；

}

Else

{

​	执行语句组B；

}

举例：

~~~ cpp
Vars
    Numeric a;
    Numeric b;
Events
OnBar(ArrayRef<Integer> indexs)
{
    if(a>0 and a<=1)
        b=1;
    Else
        b=2;
}
~~~

###### 1.3 多个互斥分支

If（逻辑条件1）

{

​	执行语句组A；

}

Else if(逻辑条件2)

{

​	执行语句组B；

}

Else if(逻辑条件3)

{

​	执行语句组C；

}

...

Else
{

}

举例：

~~~cpp
Vars
    Numeric a;
    Numeric b;
Events
OnBar(ArrayRef<Integer> indexs)
{
    if(a>0 and a<=1)
        b=1;
    else if(a>1 and a<=2)
        b=2;
    else if(a>2 and a<=3)
        b=3;
    Else
        b=4;
}
~~~

###### 1.4 条件语句的嵌套

If(逻辑条件1)

{

​	If(逻辑条件2)

​	{

​		执行语句组；

}

}

举例：

~~~cpp
Vars
    Numeric a;
    Numeric b;
Events
OnBar(ArrayRef<Integer> indexs)
{
    if(a>0)
        {
        if(a<1)
            b=1;
        }
}
~~~

##### 二、循环类型

循环类型的关键字有while和for。配合的还有to downto break continue。

###### 2.1 while类型

While（逻辑条件）

{

​	执行语句组；

}

举例：

~~~cpp
Vars
    Numeric a;
    Numeric b;
Events
OnBar(ArrayRef<Integer> indexs)
{
    While(b<3)
    {
        b=b+1;
    }
}
~~~

###### 2.2 for 增序类型

for i=min to max

{

执行语句组；

}

举例：

~~~cpp
Vars
    Integer i;
    Numeric b;
Events
OnBar(ArrayRef<Integer> indexs)
{
    for i=0 to 3
    {
        b=b+1;
    }
}
~~~

###### 2.3 for 降序类型

for i=max downto min 

{

执行语句组；

}

举例：

~~~cpp
Vars
    Integer i;
    Numeric b;
Events
OnBar(ArrayRef<Integer> indexs)
{
    for i=3 DownTo 0
    {
        b=b+1;
    }
}
~~~

###### 2.4 break

Break是触发语句所在的最内层循环的终止。

举例：

~~~cpp
Vars
    Integer i;
    Numeric b;
Events
OnBar(ArrayRef<Integer> indexs)
{
    for i=3 DownTo 0
    {
        b=b+1;
        if(b>=2)
            break;
    }
}
~~~

注释：当b>=2时，这个循环就提前终止了。

###### 2.5 continue 

Continue是跳过语句所在循环剩下的执行语句，进入下一轮的执行。

举例：

~~~cpp
Vars
    Integer i;
    Numeric b;
Events
OnBar(ArrayRef<Integer> indexs)
{
    for i=3 DownTo 0
    {
        if(b>=2)
            Continue;
        b=b+1;
    }
}
~~~

注释：当b>=2时，b=b+1始终得不到执行，所以b最终=2。

###### 2.6 循环的嵌套

For i=min to max

{

​	For j=min to max

​	{

​		执行语句组；

 }

 }

举例：

~~~cpp
Vars
    Integer i;
    Integer j;
    Array<Array<Numeric>> a;
Events
OnBar(ArrayRef<Integer> indexs)
{
    for i=3 DownTo 0
    {
        for j=0 to 3
        {
            a[i][j]=i+j;            
        }
    }
}
~~~



### 1.3 数据类型

TBQuant公式支持的数据类型有基本类型和扩展类型。总共可细分为6类，可以划分为4个级别。

| 数据类型           | 数据类型的级别 | 数据类型的内容                             |
| ------------------ | -------------- | ------------------------------------------ |
| 基本类型：普通类型 | 0              | Numeric/String/Bool/Integer                |
| 基本类型：内嵌类型 | 0              | Position,Order,Fill,Tick,Bar, CodeProperty |
| 容器类型一级       | 1              | Array,array<array>                         |
| 容器类型二级       | 2              | Dic,map,series                             |
| 类型引用           | 3              | Ref                                        |
| 类型修饰           | 3              | Global                                     |

#### 数据类型的含义

##### 1.1 基本类型：普通类型

Bool：布尔型，只包含True和False两个值。

Numeric：浮点型，包括数字、小数点、正负号。TB语言没有日期、时间类型，也是用Numeric类型表示。
Integer：长整型。

String：字符串，包括所有西文字符、汉字、数字字符，必须用英文双引号””引用，例如”ab123”。

##### 1.2 基本类型：内嵌类型

###### 1）Tick-行情快照：对象类型

| 属性          | 类型    | 说明                 |
| ------------- | ------- | -------------------- |
| dateTime      | Numeric | 时间，表示日期时间   |
| symbol        | String  | 合约代码             |
| open          | Numeric | 开盘价               |
| high          | Numeric | 最高价               |
| low           | Numeric | 最低价               |
| last          | Numeric | 最新价               |
| limitUp       | Numeric | 涨停价               |
| limitDown     | Numeric | 跌停价               |
| preClose      | Numeric | 昨收价               |
| preSettlement | Numeric | 昨结价               |
| volume        | Integer | 最新成交量           |
| totalVolume   | Integer | 总成交量             |
| openInt       | Integer | 持仓量               |
| avgPrice      | Numeric | 实时均价(今日结算价) |
| totalTurnOver | Numeric | 总成交金额(单位：元) |
| insideVolume  | Integer | 内盘                 |
| outsideVolume | Integer | 外盘                 |
| todayClose    | Numeric | 今日收盘价           |
| settlePrice   | Numeric | 当日结算价           |
| status        | Integer | 状态(暂未启用)       |
| preOpenInt    | Integer | 昨持仓               |
| turnOver      | Numeric | 成交金额             |
| rollover      | Numeric | 除权系数             |
| bidask1       | BidAsk  | 1档行情              |
| bidask2       | BidAsk  | 2档行情              |
| bidask3       | BidAsk  | 3档行情              |
| bidask4       | BidAsk  | 4档行情              |
| bidask5       | BidAsk  | 5档行情              |

BidAsk：对象类型

| 属性 | 类型    | 说明 |
| ---- | ------- | ---- |
| bidP | Numeric | 买价 |
| bidV | Integer | 买量 |
| askP | Numeric | 卖价 |
| askV | Integer | 卖量 |

###### 2）Bar-Bar数据 对象类型

| 属性         | 类型    | 说明                               |
| ------------ | ------- | ---------------------------------- |
| datetime     | Numeric | 开始时间                           |
| open         | Numeric | 开盘价                             |
| high         | Numeric | 最高价                             |
| low          | Numeric | 最低价                             |
| close        | Numeric | 收盘价                             |
| turnOver     | Numeric | 成交金额                           |
| volume       | Integer | 成交量                             |
| openInt      | Integer | 持仓量                             |
| rollover     | Numeric | 除权系数                           |
| lastDateTime | Numeric | 最后一个tick的时间戳，表示日期时间 |

###### 3）Position-持仓：对象类型

| 属性                    | 类型    | 说明                       |
| ----------------------- | ------- | -------------------------- |
| brokerId                | Integer | 经济公司ID                 |
| accountId               | String  | 资金账户ID                 |
| accountIndex            | Integer | 账户下标索引               |
| symbol                  | String  | 合约代码                   |
| longCurrentVolume       | Integer | 多头当前持仓               |
| longYesterdayVolume     | Integer | 多头剩余昨仓               |
| longPreYesterdayVolume  | Integer | 多头期初持仓               |
| longActiveVolume        | Integer | 多头未成交的报单净委托量   |
| longActiveCloseVolume   | Integer | 多头未成交的报单平仓委托量 |
| longCloseVolume         | Integer | 多头当前平仓量             |
| longCanSellVolume       | Integer | 多头可平量                 |
| longMarketValue         | Numeric | 多头持仓市值               |
| longAvgPrice            | Numeric | 多头均价（买均价）         |
| longFloatPorfit         | Numeric | 多头浮动盈亏（买盈亏）     |
| longUseMarginAmount     | Numeric | 多头占用的保证金           |
| shortCurrentVolume      | Integer | 空头当前持仓               |
| shortYesterdayVolume    | Integer | 空头剩余昨仓               |
| shortPreYesterdayVolume | Integer | 空头期初持仓               |
| shortActiveVolume       | Integer | 空头未成交的报单净委托量   |
| shortActiveCloseVolume  | Integer | 空头未成交的报单平仓委托量 |
| shortCloseVolume        | Integer | 空头当前平仓量             |
| shortCanCoverVolume     | Integer | 空头可平量                 |
| shortMarketValue        | Numeric | 空头持仓市值               |
| shortAvgPrice           | Numeric | 空头均价（买均价）         |
| shortFloatPorfit        | Numeric | 空头浮动盈亏（买盈亏）     |
| shortUseMarginAmount    | Numeric | 空头占用的保证金           |
| cancelTimes             | Integer | 合约的撤单次数             |

###### 4）Order-委托 对象类型

| 属性           | 类型    | 说明                                                         |
| -------------- | ------- | ------------------------------------------------------------ |
| brokerId       | Integer | 经济公司ID                                                   |
| accountId      | String  | 资金账户ID                                                   |
| accountIndex   | Integer | 账户下标索引                                                 |
| symbol         | String  | 合约代码                                                     |
| orderId        | Integer | 报单索引                                                     |
| exchOrderId    | String  | 报单编号（交易所）                                           |
| createDateTime | Numeric | 报单委托时间                                                 |
| volume         | Integer | 委托量                                                       |
| price          | Numeric | 委托价                                                       |
| fillVolume     | Integer | 成交量                                                       |
| fillAmount     | Integer | 成交金额                                                     |
| side           | Integer | 买卖方向，如：Enum_Buy、Enum_Sell                            |
| combOffset     | Integer | 开平标志，如：Enum_Entry、Enum_Exit、Enum_ExitToday          |
| priceType      | Integer | 价格类型，如：Enum_PriceType_Limit、Enum_PriceType_Market、Enum_PriceType_OwnBest、Enum_PriceType_OpponentBest、Enum_PriceType_BestToCancel、Enum_PriceType_BestToLimit、Enum_PriceType_TotalFilledOrCancel、Enum_PriceType_FixPrice |
| hedge          | Integer | 投机套保，如：Enum_HedgeType_Speculatio、Enum_HedgeType_Arbitrage、Enum_HedgeType_Hedge、Enum_HedgeType_MarketMaker |
| status         | Integer | 报单状态，如：Enum_Declare、Enum_Declared、Enum_FillPart、Enum_Filled、Enum_Canceling、Enum_Canceled、Enum_Deleted |
| createId       | Integer | 报单源ID，如：Enum_Trade_Source_Extra、Enum_Trade_Source_Manual、Enum_Trade_Source_Program、Enum_Trade_Source_TBPY、Enum_Trade_Source_Algo、Enum_Trade_Source_Helper、Enum_Trade_Source_Monitor、Enum_Trade_Source_ALL |
| createSource   | String  | 报单源                                                       |
| cancelSource   | String  | 撤单源                                                       |
| note           | String  | 详细信息                                                     |

###### 5）Fill-成交 对象类型

| 属性           | 类型    | 说明                                                         |
| -------------- | ------- | ------------------------------------------------------------ |
| brokerId       | Integer | 经济公司ID                                                   |
| accountId      | String  | 资金账户ID                                                   |
| accountIndex   | Integer | 账户下标索引                                                 |
| symbol         | String  | 合约代码                                                     |
| fillId         | String  | 成交索引                                                     |
| fillDateTime   | Numeric | 交易所成交时间                                               |
| fillVolume     | Integer | 成交量                                                       |
| fillPrice      | Numeric | 成交价                                                       |
| orderId        | Integer | 报单索引                                                     |
| exchOrderId    | String  | 报单编号（交易所）                                           |
| createDateTime | Numeric | 报单委托时间                                                 |
| volume         | Integer | 委托量                                                       |
| price          | Numeric | 委托价                                                       |
| side           | Integer | 买卖方向，如：Enum_Buy、Enum_Sell                            |
| combOffset     | Integer | 开平标志，如：Enum_Entry、Enum_Exit、Enum_ExitToday          |
| priceType      | Integer | 价格类型，如：Enum_PriceType_Limit、Enum_PriceType_Market、Enum_PriceType_OwnBest、Enum_PriceType_OpponentBest、Enum_PriceType_BestToCancel、Enum_PriceType_BestToLimit、Enum_PriceType_TotalFilledOrCancel、Enum_PriceType_FixPrice |
| hedge          | Integer | 投机套保，如：Enum_HedgeType_Speculatio、Enum_HedgeType_Arbitrage、Enum_HedgeType_Hedge、Enum_HedgeType_MarketMaker |
| createId       | Integer | 报单源ID，如：Enum_Trade_Source_Extra、Enum_Trade_Source_Manual、Enum_Trade_Source_Program、Enum_Trade_Source_TBPY、Enum_Trade_Source_Algo、Enum_Trade_Source_Helper、Enum_Trade_Source_Monitor、Enum_Trade_Source_ALL |
| createSource   | String  | 报单源                                                       |

###### 6）CodeProperty - 合约属性

| 属性              | 类型    | 说明                                                         |
| ----------------- | ------- | ------------------------------------------------------------ |
| symbol            | String  | 合约代码                                                     |
| bigCategory       | Integer | 商品大类，如：Enum_CategoryStocks、Enum_CategoryFutures、Enum_CategoryForexs、Enum_CategoryBonds、Enum_CategoryFunds、Enum_CategoryOptions、Enum_CategorySpotTrans、Enum_CategoryForeignFutures、Enum_CategoryForeignStocks |
| symbolName        | String  | 商品名称                                                     |
| dealTimes         | String  | 交易时段，格式为： 09:00-10:15;10:30-11:30;13:30-14:15;14:30-15:00; |
| decDigits         | Integer | 小数点位数                                                   |
| priceScale        | Numeric | 最小变动加价(1/100,1/1000)                                   |
| minMove           | Integer | 变动最小单位(1,20,50) 最小价格变动 = fPriceScale * nMinMove;默认为1 |
| contractUnit      | Integer | 合约单位 期货中1张合约包含N吨铜，小麦等                      |
| utcOffset         | Integer | 交易所世界标准时间偏移                                       |
| marginRate        | Numeric | 保证金比率                                                   |
| marginMode        | Integer | 保证金计算方式                                               |
| baseShares        | Integer | 最小委托量                                                   |
| handShares        | Integer | 一手量                                                       |
| incrementalShares | Integer | 最小交易增量                                                 |
| currencyID        | Integer | 币种，如：Enum_CORMB、Enum_COUSA、Enum_COHK、Enum_COGBP、Enum_COJPY、Enum_COCAD、Enum_COAUD、Enum_COEUR、Enum_COCHF、Enum_COKOR |
| bigPointValue     | Numeric | 每个整数点的价值                                             |

##### 1.3 容器类型一级

容器类型一级主要是增加一维数组array和二维数组array<array>。

##### 1.4 容器类型二级

容器类型二级有三种类型 series,map,dic。关于这三种类型会在本章的第三节《变量》部分进行详细介绍。这里只做简介。

###### 1）series序列变量

序列变量可以进行回溯得到当前Bar之前的Bar上的变量数据。

###### 2）map类型

Map类型的基本结构是Map<keys,values>。Map是一种字典结构，每一个key对应一个内容。

Key必须是不重复的。否则Map[Key] = Value，原来的value会被覆盖。

###### 3）dic基础数据

Dic是基础数据类型，为了方便使用基础数据而新增的数据类型。Dic的使用也必须有Key。

比如 Dic<numeric> dicvar1(key,True/False),key是基础数据的关键字，True/False基础数据是否持久化数据库 True-持久化数据库 False-内存读写。（这个参数的默认值是False）。Numeric表明dicvar1是个数值型的基础变量。

##### 1.5 ref引用

Ref一般用在函数的参数。具体应用场景分两类：1是函数需要返回多个变量；2是有些数据类型不支持函数的return返回，比如数组。

##### 1.6 global修饰

Global修饰代表这个变量被全局化成为了全局变量。公式内全局数据类型定义的变量为公式内所有数据源所共享，并且不会每次运行都重置（即可延续之前的赋值）。

###### 数据类型组合的基本原则

1)、基本类型必须指定，是否扩展、引用、修饰，根据具体应用自行决定。

基本类型的9种，必须要选择其中一种。

2)、基本类型如果需要扩展、引用、修饰，按照级别优先级排序，级别高的在前面。

比如 global map<string,array<numeric>> var1;

3)、同级别不可以组合

比如ref和global不会同时出现，numeric和order也不会同时出现

4)、特殊情况说明

​       4.1 Series不支持引用ref扩展,不支持global修饰。

​       4.2 Dic不支持内嵌类型，不支持global修饰。

​       4.3 Map<keys,values>。key的类型只能是integer/string,value的类型是基本类型和容器类型一级的组合，  values的可选类型总共27种。Map整体有54种可选类型。

​       4.4 MapRef只能用在Defs函数参数中用户函数暂不支持。

​       4.5 array<array<>>不支持series扩展。

#### 数据类型的使用场景

| 数据类型           | 数据类型的级别 | 数据类型的内容                             | 用户函数参数 | Defs函数参数 | 公式应用参数 | 变量   |
| ------------------ | -------------- | ------------------------------------------ | ------------ | ------------ | ------------ | ------ |
| 基本类型：普通类型 | 0              | Numeric/String/Bool/Integer                | 可以         | 可以         | 可以         | 可以   |
| 基本类型：内嵌类型 | 0              | Position,Order,Fill,Tick,Bar, CodeProperty | 可以         | 可以         | 不可以       | 可以   |
| 容器类型一级       | 1              | Array,array<array>                         | 可以         | 可以         | 可以         | 可以   |
| 容器类型二级       | 2              | Dic,map,series                             | 除了dic      | 除了dic      | 不可以       | 可以   |
| 类型引用           | 3              | Ref                                        | 除了mapref   | 可以         | 不可以       | 不可以 |
| 类型修饰           | 3              | Global                                     | 不可以       | 不可以       | 不可以       | 可以   |



### 1.4 特殊数据

#### Bar数据

公式进行计算时，都是建立在基本数据源(Bar数据)之上，我们这里所谓的Bar数据，是指商品在不同周期下形成的序列数据，在单独的每个Bar上面包含开盘价、收盘价、最高价、最低价、成交量及时间。期货等品种还有持仓量等数据。Bar数据也是我们口头上常说的K线数据。

所有的Bar按照不同周期组合，并按照时间从先到后进行排列，由此形成为序列数据，整个序列称之为Bar数据。

##### 以下列出所有的Bar数据系统函数：

| 函数名     | 简写 | 描述                                                         |
| ---------- | ---- | ------------------------------------------------------------ |
| Date       | D    | 当前Bar的日期。                                              |
| Time       | T    | 当前Bar的时间,即当前Bar开始生成的时间                        |
| Open       | O    | 当前Bar的开盘价。                                            |
| High       | H    | 当前Bar的最高价，Tick时为当时的委卖价。                      |
| Low        | L    | 当前Bar的最低价，Tick时为当时的委买价。                      |
| Close      | C    | 当前Bar的收盘价。                                            |
| Vol        | V    | 当前Bar的成交量。                                            |
| OpenInt    | 无   | 当前Bar的持仓量。                                            |
| CurrentBar | 无   | 当前Bar的索引值，从0开始计数。                               |
| BarStatus  | 无   | 当前Bar的状态值，0表示为第一个Bar，1表示为中间的普通Bar，2表示最后一个Bar。 |

##### Bar的索引值

超级图表中的Bar类似于队列，每一个Bar都有其相应的位置，为了方便记录与查找，将其编号称为Bar的索引值，在TB公式中用系统函数CurrentBar引用该值。

图表左边第一个Bar的CurrentBar返回值为0，向右其他Bar的则逐个递增。

注: 可通过PlotString("CurrentBar",Text(CurrentBar)); 验证结果。

##### Bar的状态值

TB公式中用系统函数BarStatus表示当前公式所应用商品当前Bar的状态值，分为三种状态：图表最左边第一个Bar，返回值0；图表最右边最后一个Bar，返回值2；中间其他Bar，返回值1。注意：只有在BarStatus的返回值为2的情况下，公式指令才会对合约进行委托发单。

#### 数据回溯

在TradeBlazer公式中有三种类型的数据回溯：<font color=blue>变量回溯</font>、<font color=blue>参数回溯</font>和<font color=blue>函数回溯</font>。

MaxBarsBack

在讨论回溯之前，我们需要了解公式中一个和数据回溯相关的系统函数MaxBarsBack，该函数返回公式应用在当前商品执行所需的最大回溯Bar数目，即CurrentBar处序列变量回溯所缺少的Bar数。该函数初始值为0，在公式应用从左到右每个Bar执行的过程中，会随着代码中对系统函数，序列变量等值的回溯调用而增加，所有Bar索引小于MaxBarsBack的输出都是不准确的，会被忽略掉。

当策略应用在多图层数据上时，任何一个图层遇到最大回溯，都会清除所有图层上的信号。

##### 变量回溯

序列类型变量是和Bar长度一致的数据排列，我们可以通过回溯来获取当前Bar以前的任意值。

要使用变量回溯，需要在变量的后面，使用中括号"[nOffset]"，nOffset是要回溯引用的Bar相对于当前Bar的偏移值，该值必须大于等于0，当nOffset = 0时，即为获取当前Bar的变量值。

例如，我们定义如下公式应用：

~~~cpp
Vars
    Series<Numeric> MyVal;
Events
OnBar(ArrayRef<Integer> indexs)
{
    MyVal = Average(Close,10);
    PlotNumeric("MyVal",MyVal[3]);
}
~~~

以上公式定义数值型序列变量MyVal，MyVal等于收盘价的10个周期的平均值，然后将序列变量MyVal的前3个Bar数据输出。

以上公式MyVal的前9个数据因为需要计算的Bar数据不足，返回的值无效，从第10个Bar开始，MyVal获取到正确的平均值，但是我们需要输出的数据是MyVal[3]，即前3个Bar的数据，因此，直到第13个Bar，有效的数据才会被输出。以上公式的13是该公式需要的最少引用周期数，如果将输出信息画到超级图表中，前12个Bar是没有图形显示的。建议用户在公式的最前面加上语句if (CurrentBar < MaxBarsBack + )  return，以避免使用越界的回溯数据。

##### 参数回溯

TradeBlazer公式支持的九种基本类型，在用户函数的参数定义中全部支持，在其他的公式中参数定义只支持三种简单类型。因此，关于参数的回溯问题，只对用户函数有效，以下我们举例说明用户函数序列参数的使用。

要使用参数回溯，需要在参数的后面，使用中括号"[nOffset]"，nOffset是要回溯引用的Bar相对于当前Bar的偏移值，该值必须大于等于0，当nOffset = 0时，即为获取当前Bar的参数值。

例如，我们定义一个用户函数MyFunc，脚本如下：

~~~cpp
Params
    Series<Numeric>   Price(0);
    Numeric         Length(10);
Vars
    Numeric         MyAvg;
    Numeric         MyDeviation;
Events
OnBar(ArrayRef<Integer> indexs)
{
    MyAvg = Summation(Price,Length)/Length;
    MyDeviation = MyAvg - Price[Length];
    Return MyDeviation;
}
~~~

以上的例子，对输入的Price我们求其10个周期的平均值，然后求出该平均值和Price的前Length个Bar的值之间的差值，将其返回。对于Price[Length]这样的参数回溯引用，其实现原理和上节所描述的变量回溯引用基本一致。

##### 函数回溯

函数回溯分为系统函数的回溯和用户函数的回溯。

系统函数中回溯的使用主要是针对Bar数据。比如我们需要获取两个Bar前的收盘价，脚本为Close[2]；又或者我们需要获取10个Bar前的成交量，脚本为Vol[10]。对于Bar数据的回溯是系统函数中最常用的，虽然也可以对行情数据和交易数据等进行回溯，但是大部分并无实质的意义，返回的结果和不回溯是一样的，因此，不推荐如此使用。

要对系统函数回溯引用，我们可以通过在函数名称后面添加"[nOffset]"获取其回溯值，nOffset是要回溯引用的Bar相对于当前Bar的偏移值，该值必须大于等于0，当nOffset = 0时，即为获取当前Bar的参数值。

带有参数的函数回溯，需要将"[nOffset]"放到参数之后，另外，无参数和使用默认参数的情况下，函数调用的括号可以省略。例如:Close[2]等同于Close()[2]。

用户函数的回溯和系统函数原理基本一致，但考虑到系统的执行速度和效率等因素，目前，TradeBlazer公式不支持对用户函数的回溯，如果您想要获取用户函数的回溯值，建议您将函数返回值赋值给一个序列变量，通过对序列变量的回溯来达到相同的目的。

如下面的脚本所示，取Close的10个Bar平均值的4个周期前的回溯值:

~~~cpp
Vars
    Series<Numeric> AvgValue;
    Numeric       TmpValue;
Events
OnBar(ArrayRef<Integer> indexs)
{
    AvgValue = Average(Close,10);
    TmpValue = AvgValue[4];
    ...
}
~~~

#### 叠加数据

交易开拓者的超级图表支持多周期多品种商品叠加的显示，当叠加的超级图表调用各项公式时，可能有需要使用叠加的商品对应的基础数据，针对这样的需求，TradeBlazer公式提供了叠加数据的支持。

假定，我们新建一个超级图表模块，其叠加的商品为：cu1810，cu1811和cu1812。此时，根据叠加操作的先后顺序，cu1810为Data0，cu1811为Data1，cu1811为Data2，在TradeBlazer公式中，我们可以通过Data0.Open()，Data1.Close()，Data2.Vol()类似方法调用叠加Bar数据，叠加Bar数据的函数和Bar数据一样，只是需要在调用的时候加上数据源。

如果省略对数据源的指定，则默认数据源为Data0，直接使用Open()表示Data0.Open()。

叠加数据源的个数没有限制。100个内的数据源可以使用保留字Data0-Data99，更多的数据源可以使用Data数组来表示，譬如Data[2000]。

#### 行情数据

除了Bar数据之外，TradeBlazer公式还可以支持实时行情数据的调用，行情数据是指当前商品最新的报价数据，该数据和Bar无关，行情数据的回溯没有意义。

行情数据只在最后Bar是有意义的，其他Bar会返回无效值。因此，在调用行情数据函数时，为了提高效率，最好按照以下方法：

~~~cpp
If(BarStatus()==2)
{
    //调用行情数据函数
}
~~~

行情数据函数都按照以下格式命名Q_XXXXX，比如Q_Close，Q_BidPrice。在调用行情数据的时候，需要判断当前行情数据是否有效，系统提供函数QuoteDataExist来对有效性进行判断。如果行情数据已经准备好，返回True,否则，返回False。

#### 账户数据

TradeBlazer公式可以支持实时帐户数据的调用，帐户数据是指当前交易帐户最新的帐户数据，该数据和Bar无关。

帐户数据只在最后Bar是有意义的，其他Bar会返回无效值。因此，在调用帐户数据函数时，为了提高效率，最好按照以下方法：

~~~cpp
If(BarStatus()==2)
{
    //调用帐户数据函数
}
~~~

帐户数据函数都按照以下格式命名A_XXXXX，比如A_BuyPosition，A_OpenOrderContractNo。在调用行情数据的时候，需要判断当前是否已经启动自动化交易，系统提供函数A_AccountID来对有效性进行判断。如果帐户数据已经准备好，返回交易帐户ID,否则，返回空的字符串。
属性数据
TradeBlazer公式还提供一组重要的属性数据，反映了该商品的一些基本信息，比如当前数据周期，买卖盘个数、保证金设置等信息。在所有的Bar上面获取的市场属性数据都是一样的，属性数据的回溯没有意义。



### 1.5 参数与变量

#### 参数

参数是一个预先声明的地址，用来存放输入参数的值，声明之后可以在公式中使用该参数名称引用其值。参数的值在公式的内部不能被修改，在整个程序中一直保持不变，不能对参数进行赋值操作(引用参数是个特例)。

参数的好处在于您可以在调用公式应用的时候才指定相应的参数，而不需要重新编译。

例如，我们常用的移动平均线指标，就是通过不同的Length来控制移动平均线的周期，在调用指标时可以随意修改各个Length的值，使之能够计算出相对应的移动平均线。您可以指定4个参数为5,10,20,30计算出这4条移动平均线，也可以修改4个参数为10，22，100，250计算出另外的4条移动平均线。

参数的修改很简单，在超级图表调用指标的过程中，您可以打开指标的属性设置框，切换到参数工作区，手动修改各项参数的值，然后应用即可，交易开拓者将根据新的参数设置计算出新的结果，在超级图表中反映出来。

另外，参数的一个额外的优点是，我们可以通过修改公式应用不同的参数，测试交易策略的性能优劣，达到优化参数的目的。

##### 参数的类型

参数类型和用户函数、Defs函数和公式应用有关。

引用参数是在调用的时候传入一个变量的地址，在用户函数内部会修改参数的值，在函数执行完毕，上层调用的公式会通过变量获得修改后的值，引用参数对于需要通过用户函数返回多个值的情况非常有用。

序列参数可以通过回溯获取以前Bar的值，具体介绍可参见参数回溯。

##### 参数的声明

使用参数之前，必须对参数进行声明，TB公式使用关键字"Params"进行参数声明，并指定参数类型。可以选择赋默认值，也可以不赋默认值。如果某个参数没有赋予默认值，则这个参数之前的其他参数的默认值都将被忽略。

参数定义的语法如下：

Params

​    参数类型 参数名1(初值);

​    参数类型 参数名2(初值);

​    参数类型 参数名3(初值);

例：

~~~cpp
Params
    Bool           bTest(False);       //定义布尔型参数bTest，默认值为False;
    Numeric        Length(10);         //定义数值型参数Length，默认值为10；
    Series<Numeric>Price(0);           //定义数值型序列参数Price，默认值为0；
    NumericRef     output(0);          //定义数值型引用参数output，默认值为0；
      String         strTmp("Hello");    //定义字符串参数strTmp,默认值为Hello；
    Array<Numeric> nArray(0);           //定义一维数组，默认为0；
    Array<Array<Numeric>> nArrayParam(1);     //定义二维数组，默认值都为1；
~~~

整个公式中只能出现一个Params声明，并且要放到公式的开始部分，变量定义之前。

注：本参数无初始值，则要求公式体内的前几个参数也不能有初始值。

##### 参数的默认值

在声明参数时，通常会赋给参数一个默认值。例如上例中的False，10，0等就是参数的默认值。用户函数的默认值是在当用户函数被其他公式调用，省略参数时作为参数的输入值，其他五种公式的默认值是用于图表，报价等模块调用公式时默认的输入值。

参数的默认值的类型在定义的时候指定，默认值在公式调用的时候传入作为参数进行计算。只能够对排列在后面的那些参数提供默认参数，例如：

~~~cpp
Params
    Numeric	MyVal1;
    Numeric	MyVal2(0);
    Numeric	MyVal3(0);
~~~

您不能够使用以下方式对参数的默认值进行设定：

~~~cpp
Params
    Numeric	MyVal1(0);
    Numeric	MyVal2(0);
    Numeric	MyVal3;
~~~

##### 参数使用

在声明参数之后，我们可以在脚本正文中通过参数名称使用该参数，在使用的过程中要注意保持数据类型的匹配，示例如下：

~~~cpp
Params
    Series<Numeric> Price(1);
Vars
    Series<Numeric> CumValue(0);
begin
    CumValue = CumValue[1] + Price;
    Return CumValue;
end
~~~

在以上的公式中，首先定义了一个数值型序列参数Price，并将其默认值设置为1。接着定义了一个变量CumValue。脚本正文中，将CumValue的上一个Bar值加上Price，并将值赋给CumValue，最后返回CumValue。

通过上述的公式可以看到，我们只需要调用参数名，就可以使用参数的值进行计算了，如果要对序列参数进行回溯，请参见参数回溯。

##### 参数说明

在定义参数变量的时候，可以用添加注释。而公式系统中参数的注释在打开公式应用设置的时候会进行展示。

比如下图peroetrade的公式中声明了4个变量，并且在代码中对4个变量进行了注释。那么在公式应用设置界面就有一列参数说明里面可以看到这些注释。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_005.png"  width="750" />

##### 公式参数的修改

公式参数的修改，可以直接双击参数值，进行编辑。也可以对着参数所在行的其它字段进行双击，弹出参数编辑框，进行修改。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_006.png"  width="" />

##### 引用参数	

TradeBlazer公式的用户函数可以通过返回值，返回函数的计算结果，返回值只能是四种简单类型。当我们需要通过函数进行计算，返回多个值的时候，单个的返回值就不能满足需求了。在这种情况下，我们提出了引用参数的概念，引用参数是在调用的时候传入一个变量的地址，在用户函数内部会修改参数的值，在函数执行完毕，上层调用的公式会通过变量获得修改后的值。因为引用参数的使用是没有个数限制，因此，我们可以通过引用参数返回任意多个值。引用参数不应含有初始值。

例如，用户函数MyFunc如下：

~~~cpp
Params
    Series<Numeric> Price(0);
    NumericRef oHigher;
    NumericRef oLower;
Vars
    Numeric Tmp(0);
Begin
    Tmp = Average(Price,10);
    oHigher = IIf(Tmp > High,Tmp,High);
    oLower = IIf(Tmp < Low,Tmp,Low);
    Return Tmp;
End
~~~

以上代码通过两个数值型引用参数返回10个周期的Price平均值和最高价的较大值oHigher，以及10个周期的Price平均值和最低价的较小值oLower，并且通过函数返回值输出10个周期的Price平均值。在调用该用户函数的公式中，可以通过调用该函数获得3个计算返回值，示例如下：

~~~cpp
Vars
    Numeric AvgValue;
    Numeric HigherValue;
    Numeric LowerValue;
Events
OnBar(ArrayRef<Integer> indexs)
{
    AvgValue = MyFunc(Close,HigherValue,LowerValue);
    ...
}
~~~

#### 变量与常量

TB公式中常量一般指的是常数，直接参与公式运算；变量指的是在公式运算过程中值会发生改变的量。变量是一个存储值的地址，当变量被声明之后，就可以在脚本中使用，可以对其赋值、计算。要对变量进行操作，直接使用变量名称即可。

变量的主要作用是存放计算或比较的结果，在之后的脚本中可直接引用，而无需重新计算过程。

在使用变量之前，必须对变量进行声明，TB公式使用关键字“Vars”来进行变量声明，并指定变量类型。变量声明对默认值没有硬性规定，可以赋值，也可以不赋值。变量的命名需要满足变量的命名规则。

##### 变量的类型

TradeBlazer公式支持上百种数据类型，但对于变量定义，引用类型是无效的。其余数据类型比如基本数据类型、序列数据类型、数组数据类型、公式内全局数据类型、基础数据类型可以用于公式变量类型。

##### 变量的声明	

在使用变量之前，必须对变量进行声明，TBQuant公式使用关键字"Vars"来进行变量宣告，并指定变量类型。可以选择赋默认值，也可以不赋默认值。

变量定义的语法如下：

Vars

   变量类型 变量名1(默认值);

   变量类型 变量名2(默认值);

   变量类型 变量名3(默认值);

例：

~~~cpp
Vars
    Series<Numeric> MyVal1(0); //定义数值型序列变量MyVal1，默认值为0；
    Numeric MyVal2(0); //定义数值型变量MyVal2，默认值为0；
    Global Numeric MyVal3(0); //定义公式内全局数值型变量MyVal，默认值为0；
    Array<Integer> MyVal4; //定义数值型变量MyVal4；
    Bool MyVal3(False); //定义布尔型变量MyVal3，默认值为False;
    String MyVal4("Test"); //定义字符串变量MyVal4，默认值为Test。
~~~

整个公式中只能出现一个Vars声明，并且要放到公式的开始部分，在参数定义之后，正文之前。

【说明】

1.公式应用中，数据源数据类型的变量每个数据源一份，数据源可以直接引用该类变量，如下例所示。

~~~cpp
Vars
    Series<Numeric> AvgValue1; 
    Series<Numeric> AvgValue2;
    Global Numeric dataIndex;
events
OnBar(ArrayRef<Integer> indexs)
{
    For dataIndex=0 To DataSourceSize -1
    {
        Data[dataIndex].AvgValue1 = Data[dataIndex].AverageFC(Data[dataIndex].Close,FastLength);
        Data[dataIndex].AvgValue2 = Data[dataIndex].AverageFC(Data[dataIndex].Close,SlowLength);
    }
 }
~~~

2.在函数中，变量只有一份，为公式内所有数据源所共享。

3.公式内全局数据类型Global的变量为公式内所有数据源所共享，不会在公式每次运行都重置（即可延续之前的赋值）。

~~~cpp
Global Integer nVar;
Global Numeric dVar;
Global Bool    bVar;
Global String  sVar;
~~~

##### 变量的默认值

在声明变量时，通常会赋给变量一个默认值。例如上例中的0，False，"Test"等就是变量的默认值。如果某个变量没有赋予默认值，系统将会自动给该变量赋予默认值。数值型变量的默认值为0，布尔型变量的默认值为False，字符串的默认值为空串。

变量的默认值是在当公式在执行时，给该变量赋予的初值，使该变量在引用时存在着有效的值。在该公式每个Bar的执行过程中，该变量的默认值都会被重新赋值。

##### 变量的赋值

变量声明完成之后，用户可以直接使用默认值，也可以根据实际需要在脚本中重新为变量赋值。

语法如下：

~~~cpp
Name = Expression;
~~~

"Name"是变量的名称，“Expression”是表达式，该语句的意思是将表达式的结果赋值给变量，其中表达式的类型必须与变量的数据类型匹配，即若变量声明为数值型，则表达式必须为数值型的表达式。

例：

~~~cpp
Value1 = Average(Close , 10); //将Close的10周期平均值赋值给变量Value1
~~~

例： 

~~~cpp
Vars
    Bool KeyReversal(False);
events
OnBar(ArrayRef<Integer> indexs)
{
    KeyReversal = Low < Low[1] AND Close > High[1];
    ...
}//声明名为"KeyReversal"的逻辑型变量，然后又把计算的值赋给它。
~~~

##### 变量的使用

变量定义、赋值之后，在表达式中直接使用变量名就可以引用变量的值。例如在下面的语句中计算了买入价格后，把值赋给数值型变量EntryPrc，在买入指令中便可直接应用变量名，通过变量名便可引用变量的值：

~~~cpp
Vars
    Numeric EntryPrc(0);
events
OnBar(ArrayRef<Integer> indexs)
{
    EntryPrc = Highest(High,10);
    If (MarkerPosition <> 1)
    {
        Buy(1,EntryPrc);
    }
}
~~~

接下来的例子，我们计算最近10个Bar最高价中的最大值（不包括当前Bar），对比当前High，然后通过If语句，产生报警信息。

~~~cpp
Vars
    Bool Con1(False);
events
OnBar(ArrayRef<Integer> indexs)
{
    Con1 = High > Highest(High,10)[1];
    If(Con1)
    {
        Alert("New 10-bar high");
    }
}
~~~

【说明】

公式应用中的变量需显式调用，如Data0.Close。如不显示数据源则默认其数据源为Data0。

#### 序列变量

序列变量是变量中的一种，可以对序列变量进行回溯得到当前Bar之前的Bar上的变量数据。序列变量的声明与简单变量一样，仅数据类型不同。

##### 序列变量的定义

例：

~~~cpp
Vars
    Series<Numeric> MyNum (0); //定义数值型序列变量，默认值为0
    Series<Numeric> MyNum1 (0，20); //定义数值型序列变量，第一个为默认值0，后一个为最大回溯范围20
    Series<Integer> MyNum (0); //定义整数型序列变量，默认值为0
    Series<Bool>    MyBool (False); //定义布尔型序列变量，默认值为False
    Series<String>    MyStr (""); //定义字符串型序列变量，默认值为空字符串序列变量
~~~

##### 序列变量的赋值

和简单变量一样，可以对其赋予默认值。

序列变量定义之后，使用方式类似于简单变量。除了支持全部简单变量的功能之外，序列变量还可以通过"[nOffset]"来回溯以前的变量值。

对于序列变量，TB公式在内部针对其回溯的特性作了很多特殊处理，并需要保存相应的历史数据。因此，和简单变量相比，序列变量的执行速度、占用内存空间等方面都作了一些牺牲。尽管可定义序列变量把它当作简单变量来使用，但强烈建议仅将需要回溯的变量定义为序列变量。

在指定条件下对某变量赋值，如果该变量是序列变量，它的值会传递下去，直至语句对其进行新的赋值。如果该变量是普通变量，则赋值仅针对条件满足的这个Bar，其它Bar上的变量记录的仍是初始值，这是由TB公式的运行机制决定的。

通过MyNum1 (0，20)格式声明，第一个为序列变量默认值，第二个为设置的序列变量的回溯范围。相对于在公式菜单栏“序列变量范围”，有更高优先级。

例：分别定义简单变量aaa，序列变量bbb，对其进行同样的赋值。部分公式代码如下：

~~~cpp
Con1= CrossOver(ma1,ma2);
Con2= CrossUnder(ma1,ma2);
If(Con1)
{
    aaa = 1;
    bbb = 1;
}
If (Con2)
{
    aaa = -1;
    bbb = -1;
}
（ma1，ma2分别为短期均线、长期均线值）
~~~

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_007.png" width="600"/>

上图是简单变量和序列变量赋值示例，如图所示aaa、bbb这两个变量的赋值虽然条件相同，但其结果大不相同。可以看到，在均线上穿时，aaa与bbb都是为1，均线下穿时，aaa与bbb都是为-1。不同的是，在除去上下穿的Bar上，aaa与bbb的值则有所差异。变量aaa 都是默认值“0”，而序列变量bbb则是传递着上一个Bar上此变量的值，直到条件改变此值。 aaa做为普通变量不可以使用回溯取值，而做为序列变量的bbb则可以回溯取值，如：bbb[5]。

##### 序列变量的赋值过程与逻辑

###### 1.序列变量在中间Bar上的赋值

序列变量是和图表中K线数据等长的变量，它的赋值过程是当程序在某个Bar运行时，仅仅将序列变量对应该Bar的值赋上，然后传递下去，直到变量再次被改变。例：序列变量bbb[5]上曾经赋值bbb[4]=1，之后bbb的值一直没有新的改变，直到当前Bar，bbb=-1，即bbb[0]=-1，bbb[3]、bbb[2]、bbb[1]的值为1。序列变量赋值之后，不允许再重新为之前对应Bar变量赋值。

为避免序列数据混乱，建议不要在条件语句和循环语句中为序列变量赋值。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_008.png" width="600"/>

###### 2.序列变量或Bar数据取值时前面没有序列值，则返回无效值。

如下图，在T1时刻取data0的序列变量，则返回无效值。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_009.png" width=""/>

###### 3.数据源在当前时间上没有bar数据时

其序列变量不被赋值，但调用该序列变量时会返回数值。

比如我们叠加一个2分钟和6分钟的两个数据源的策略研究，加载如下策略：

~~~cpp
Params

Vars
    Series<Numeric> value1;
events
OnBar(ArrayRef<Integer> indexs)
{
    If(CurrentBar == 0)
    {
        FileDelete("d:/series.tbf");
        FileAppend("d:/series.tbf","初始化");
    }
    data0.Value1 = data0.Value1 + 1;
    data1.Value1 = data1.Value1 + 1;
    FileAppend("d:/series.tbf","time="+TimeToString(Time)+",data0.value1="+Text(data0.Value1)+",data1.value1="+Text(data1.value1));
}
~~~

运行之后，我们查看文档。图表中第一根BAR的时间是9：00：00，第一个品种是2分钟图表，第二个品种是6分钟图表。

在9：02：00和9：04：00，第一个品种有对应K线，第二个品种没有对应的K线。这时候第二个品种的序列变量是不会被改变的。只维持原来数值，可以被第一个品种调用。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_010.png" width=""/>

###### 4.当序列变量定义为下列格式时

序列变量会变成一种特殊的数据类型。Series<Numeric> MyNum1 (0，1)这样的序列变量只能保留一个数值不能回溯。所以它在实时运行时没有办法同时保留上一根BAR最后的状态和每个实时TICK的运行状态。系统选择保留的是每个实时TICK的运行状态。这个时候序列变量已经是随着每个TICK更新，它的初始状态并不是来自于上一根BAR，而是来自于上一个TICK的运行情况。可以把这样的序列变量理解为一个只在当前数据图层起作用的全局变量。

比如现在叠加了3个品种，那么每一个图层i都有一个序列变量 data[i].mynum1,它是一个只在第i个图层才会存在的全局变量。

~~~cpp
Begin
	Mynum1=mynum1+1;
End
~~~

如果实盘运行经历了三根BAR，那么每跟BAR运行完的mynum1的数值是跟TICK相关的。

|                  | 初始值      | BAR1        | BAR2         | BAR3         |
| ---------------- | ----------- | ----------- | ------------ | ------------ |
| 三个品种的TICK数 |             | （2，5，6） | （3，2，4）  | （1，1，1）  |
| 三个品种的mynum1 | （0，0，0） | （2，5，6） | （5，7，10） | （6，8，11） |

#### 全局变量

全局变量是一类较为特殊的数值型变量，保存的变量值不会因为Bar的改变而消失，它的作用范围是策略单元，策略单元内不同的公式应用和函数都可以访问。关掉策略单元后，所有保存的值才会消失。

##### 1、全局变量和普通变量（数据源变量和公式内全局变量）的区别

TB公式的执行机制是行情驱动，从左至右、从上至下的，即程序在图表中执行不仅仅运行一次，而是多次执行（历史行情中每一个Bar都会触发程序，实时行情中每一个Tick都会触发）。此时，程序每运行一次，都会对普通变量重新分配内存，进行初始化操作，所以普通变量无法保存上一个Bar中程序运行的结果；而全局变量是附着于策略单元的，它的内存全局分配，程序运行时不重新分配，它的值不会因为某次程序运行结束而消失，只有关闭公式加载的策略单元时，全局变量才清除。

##### 2、全局变量的使用方式

全局变量有两种方式，一种是在变量定义里使用global来定义全局变量，另外一种是TBQunat继承原有产品的四个系统函数来实现的全局变量。

###### 1）在VARS变量定义里使用global定义全局变量

~~~cpp
Vars
   Global Numeric a;
Global array<numeric> a;
~~~

使用这种方式定义全局变量，可以在numEric，string，bool，integer前面加global就可以实现。可以定义全局的普通变量，全局的数组，但是不能定义全局的序列变量。

| Global Bool      | Global Numeric      | Global Integer      | Global String       |
| ---------------- | ------------------- | ------------------- | ------------------- |
| Global BoolArray | Global NumericArray | Global IntegerArray | Global StringrArray |

###### 2）使用系统函数的全局变量

这样的全局变量的初始值为InvalidNumeric。使用之前需要为其赋初值，赋值之后全局变量的值不会随当前Bar变化而变化，只有再次对全局变量赋值才会改变。

通过系统函数SetGlobalVar和SetGlobalVar2设置某个数值索引或字符串索引的全局变量值。暂时只支持存储数字。

通过系统函数GetGlobalVar和GetGlobalVar2获取指定数值索引或字符串索引的全局变量值。

| 函数名        | 含义                           |
| ------------- | ------------------------------ |
| SetGlobalVar  | 设置某个索引的全局变量值       |
| SetGlobalVar2 | 设置某个字符串索引的全局变量值 |
| GetGlobalVar  | 获取某个索引的全局变量值       |
| GetGlobalVar2 | 获取某个字符串索引的全局变量值 |

【说明】在并行计算中不能使用全局变量。

#### 基础数据

基础数据从广义上理解是交易所行情之外的其它数据。比如股票的财务报表数据，比如商品的分类数据，比如连续合约的合约切换等信息。

对应基础数据需要定义基础数据的变量。

##### 1、变量定义方式

Dic<数据类型> 变量名（String 键名，bool 是否持久化，String关联标的），后面两个可以不写

1)键名和关联标的可以从资讯——基础数据中心查询，特别注意要区分大小写。比如"TB_FinanceInd_F014N" 不能改为"tb_FinanceInd_F014N","symtem",不能改为"Symtem"。

2）如果不持久化，软件重启，这个基础数据就清除了。

3）string关联标的如果不写，那么就自动关联读取时候的数据图层，如果这个数据图层有基础数据就返回，否则无效值。

4）基础数据是系统类型的，关联标的是"symtem",必须要填写。

比如下面的代码：

~~~cpp
Vars
Dic<Numeric> roe("TB_FinanceInd_F014N",False); //读取财务指标ROE
~~~

Dic<Numeric>是变量的类型，roe是用户自己指定的变量名，
"TB_FinanceInd_F014N"是TB基础数据库中财务指标ROE的内部键名，False代表不持久化，最后一个参数string关联标的，省略没有给。

##### 2、函数调取基础数据

如果在TBQuant里面则使用GetDicValue()；

~~~ cpp
void GetDicValue(String name, String symbol, Numeric time, 接收基础数据的变量 rValue) 
~~~

name是基础数据的键名，symbol是关联标的，time是时间，最后一个rvalue是接收基础数据的变量。

如果读取基础数据不清楚这些参数的具体数值，可以点开资讯——基础数据中心进行搜索查看。具体使用可以看《TBQuant软件使用》的第十二章12.4.3节的数据查询。

##### 3、基础数据写入

如果用户想自定义基础数据，数据怎么写入。

###### 1）如果在TBQuant里面则使用SetDicValue();

~~~cpp
bool SetDicValue(String name, String symbol, Numeric time, Numeric rValue, Bool isPersistence = false)
~~~

name是基础数据的键名，symbol是关联标的，time是时间，最后一个rvalue是写入基础数据的变量。

特别的如果用户向定义一个不受关联标的限制的基础数据，也就是可以在所有数据图层都能用的基础数据。那么symbol这一项最好写成是一个用户自定义的字符串。

比如，SetDicValue("001","myindustry",SystemDateTime(),subarray,True);subarray的内容是一个字符串数组。
那么在基础数据中心，我们可以查询到如下结果。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_011.png" width=""/>

###### 2） 在TBQuant里面数据写入，也可以通过直接赋值的方式。

给定义好的基础数据进行写入。

比如下面的demo:

~~~cpp
Params
Vars
    Dic<Bool> boolDs("boolDs",False);
    Dic<Integer> integerDs("integerDs",False);
    Dic<Numeric> numericDs("numericDs",False);
    Dic<String> stringDs("stringDs",True);
    Integer mybarcount;
Events
OnBar(ArrayRef<Integer> indexs)
{
    mybarCount = CurrentBar();
    if(barCount % 2 == 0)
    {
        boolDs[0] = True;
        integerDs[0] = barCount;
        numericDs[0] = barCount / 10;
        stringDs[0] = "str_" + Text(barCount);
    }
}
~~~

#### 数组

在TBQuant里面我们支持一维数组和二维数组对基础数据类型的容器扩展。

##### 1、数组的定义和赋值

比如下面的例子，定义了一个一维数组和一个全局的二维数组。并且给其中的元素进行了赋值。数组参数的默认值可以直接使用列表形式赋值。

~~~cpp
Vars
    Array<Numeric> na1([1,2]);
    Array<Array<Numeric>> na2([[1,2],[3,4]]);
Events
OnBar(ArrayRef<Integer> indexs)
{
    if(BarStatus==2)
    {
        Print("默认值：");
        Print(TextArray(na1));
        Print(TextArray(na2));
        na1=[5,6];
        na2=[[5,6],[7,8]];
        Print("修改后：");
        Print(TextArray(na1));
        Print(TextArray(na2));
    }
}
~~~

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_012.png" width=""/>

注意：数组的定义不需要指定数组的大小，数组大小会自动根据代码对数据元素的使用而扩容。

##### 2、数组的运算

数组的运算可以有函数来实现。而基本的四则运算则可以直接使用运算符实现。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_013.png" width=""/>

##### 3、数组的相关函数

ArrayClear: 数组的全部删除。

ArrayClear: 删除二维数组的全部内容。

ArrayCompare: 对两个数组进行比较。

ArrayCompare: 对两个二维数组进行比较。

ArrayCopy: 复制数组的内容。

ArrayCopy: 复制二维数组内容。

ArrayEqual: 检验两个数组是否相等。

ArrayEqual: 检验两个二维数组是否相等。

ArrayErase: 数组的元素删除。

ArrayErase: 二维数组的指定元素删除。

ArrayInsert: 数组的单个数据插入。

ArrayInsert: 二维数组插入单个元素。

ArrayInsertRange: 数组的多个数据插入。

ArrayInsertRange: 二维数组插入多个元素。

ArraySort: 对数组进行排序。

ArraySort: 二维数组排序。

ArraySwap: 交换数组的内容。

ArraySwap: 交换二维数组的内容。

GetArraySize: 获取数组的大小。

Na1Sort: 一维数组排序带下标。

Na1Sort2: 一维数组排序带下标，原数组不变。

Na1Max: 一维数组的最大值。

Na1Min: 一维数组的最小值。

Na2Add: 二维数组的加法。

Na2Dev: 二维数组的减法。

Na2Mul: 二维数组的乘法。

Na2Inv: 二维数组的求逆。

Na2Trans: 二维数组的转置。

Na2Abs: 二维数组的绝对值。

Na2Sum: 二维数组的元素求和。

SetArraySize: 设置数组的大小和初始值。

SetArraySize: 设置二维数组的大小和初始值。

SortIds: 一维数组排序带双重下标。

#### Map

Map是一种字典类型的数据。Map<keys,values>的结构提供了不重复的key与数值的一一对应的存储。

Key支持的类型只能是integer/string,value的类型是基本类型和容器类型一级的组合，value的可选类型总共27种。Map整体有54种可选类型。

###### 1）Map的定义

Map<keytype,valuetype> mapvar;

比如Map<integer,string> mapvar;这样就定义了一个key为整数类型,value为string类型。

###### 2）Map的增加元素

Map[newkey]=newvalue;

比如使用上面定义的Map Mapvar[1]=“china”; Mapvar[2]=“usa”;

###### 3）Map的读取元素

Map[key]

比如Commenta（Mapvar[1]）；内容为“china”。

###### 4）Map的删除元素

​	MapErase(Map,delkey)

​	比如MapErase(Mapvar1,2),就删除了Map的内容Mapvar[2]=“usa”。

###### 5）Map的大小获取

​	GetMapsize(Map)

​	比如沿用上面2）的结果，GetMapsize(mapvar1),这时候长度为2。

###### 6）Map的所有key的读取

​	GetMapkeys(Map,array<keytype>)

​	比如先定义一个整形数组 vars array<integer> arr1;

​    沿用上面2）的结果，GetMapkeys(Mapvar1,arr1)。那么就读取了Mapvar1的keys,存储到了arr1的数组里面。

​    Arr1[0]=1;arr1[1]=2;

###### 7）Map的关键字是否存在的查询

​	Mapcontain(Map,findkey)

​	比如沿用上面4）,Mapcontain(mapvar1,2)这是返回的结果是False。因为已经删除了这个内容。

###### 8) Map的指定元素查找

Bool MapFind(MapRef mapValue, Key, value)

比如MapFind(mapvar1,1,var2)。可以查找mapvar1中是否有键值为1的元素，并把对应的数值赋值给var2。

###### 9）Map删除映射表的全部内容

MapClear(MapRef mapValue)



### 1.6 系统函数

TradeBlazer公式的系统函数，可根据使用范围在相应类型的公式中直接调用，计算后返回结果值。

目前的系统函数支持四种数据类型，除了TradeBlazer公式中定义的三种基本数据类型：Bool，Numeric，String之外，新加入Integer（长整型）类型，使系统函数能够更加快捷的进行计算，TradeBlazer公式在处理的时候自动将Numeric和Integer进行转化，用户无需进行特别的处理。

TradeBlazer公式现有的系统函数主要分为：数据函数、时间函数、数学函数、其它函数、交易函数、属性函数、帐户函数、颜色函数、字符串函数等。每个系统函数都有自己的适用范围和使用规范，详细说明参见附录。

#### 1、输出函数介绍

TB的公式应用提供PlotNumeric、PlotBool、PlotString三个函数在图表上输出数值、布尔值以及字符串，以满足交易者在做技术分析时的各种个性化的输出。TBQuant又增加了plotauto,plotdic,plotKline，upplot,print等函数的输出功能。

例：分析系统提供的MA移动平均线（公式代码如下图所示）

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_014.png" width=""/>

MA移动平均线公式定义了4个参数，存储不同的周期值，分别赋默认值5,10,20,30。公式的代码段只有4条输出不同周期均线的语句，使用了PlotNumeric函数进行数值的输出，AverageFC函数求出不同周期的平均值。公式执行效果如下图所示：

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_015.png" width="750"/>

##### PlotNumeric

PlotNumeric-----在当前Bar输出一个数值；

语法：

~~~cpp
PlotNumeric(String Name,Numeric Number,Numeric Locator=0,Integer Color=-1,Integer BarsBack=0)
~~~

参数说明：

Name 输出值的名称字符串，可以为中文、英文、数字或者其它字符；

Number 输出的数值；

Locator 输出值的定位点，默认值为0，表示输出单点，否则输出连接两个值线段；

Color 输出值的显示颜色，默认值为-1，表示使用属性设置框中的颜色；

BarsBack 从当前Bar向前回溯的Bar数，默认值为0，表示当前Bar。

例1：PlotNumeric ("Close",Close);

输出Close的值，如下图所示。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_016.png" width="750"/>

例2：PlotNumeric ("OpenToClose",Open,Close);

输出开盘价与收盘价的连线。（需要在公式属性的输出线形选择柱状图），如下图所示。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_017.png" width=""/>

例3：PlotNumeric ("AvgValue",average(close,5),0,Blue);

输出一条蓝色的以收盘价计算的五日平均线，如下图所示。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_018.png" width="750"/>

【注意】：当后面的参数都使用默认值的情况下，可省略不写，如例1。但如果后面还有其它参数要指明，而只是中间某一个或者多个参数需要默认值的话，则中间参数不可省略，需将默认值一一填写，如例3。

##### PlotBool

PlotBool-----在当前Bar输出一个布尔值。在图表上的表现为指定位置显示圆脸图标，布尔值为真显示一个绿色的笑脸图标，布尔值为假则显示一个红色的哭脸图标。

语法：

~~~cpp
PlotBool(String Name,Bool bPlot,Numeric Locator=0,Integer Color=-1,Integer BarsBack=0)
~~~

参数说明：

Name 输出值的名称，不区分大小写；

bPlot 输出的布尔值；

Locator 输出值的定位点；

Color 输出值的显示颜色，默认值为-1，表示使用属性设置框中的颜色

BarsBack 从当前Bar向前回溯的Bar数，默认值为0，表示当前Bar。 

例 ：PlotBool ("con",con,High); 

在Bar的最高价位置输出条件con的布尔值，如下图所示。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_019.png" width="750"/>

##### PlotString

PlotString-----在当前Bar输出一个字符串。

语法：

~~~cpp
PlotString(String Name,String str,Numeric Locator=0,Integer Color=-1,Integer BarsBack=0)
~~~

参数说明：

Name 输出值的名称，不区分大小写；

str 输出的字符串；

Locator 输出值的定位点；

Color 输出值的显示颜色，默认值为-1，表示使用属性设置框中的颜色；

BarsBack 从当前Bar向前回溯的Bar数，默认值为0，表示当前Bar。

例 ：

PlotString ("Bear Market","Bear Bear",High,Yellow); 

在Bar的最高价位置输出一个黄色的字符串Bear Bear，如下图所示。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_020.png" width="750"/>

**【注意事项】**

###### 输出数据的名称

函数PlotNumeric、 PlotBool 以及PlotString的第一个参数都是“字符串”，该字符串的意义是给将要输出的值命名，支持中、英文字符。在同一个公式应用里，同一类型的输出值需要分别命名，不能重复使用相同的名称。

###### 输出颜色的选择

PlotNumeric、 PlotBool、 PlotString这三个输出函数，从右向左数第二个参数均为输出颜色的选项，可以填写交易开拓者系统函数里的任一颜色函数，也可以使用默认值，然后在公式属性里对颜色进行自定义设置。

系统函数里包括以下颜色函数：

black 黑色、blue 蓝色、cyan 青色、darkbrown 深棕、darkcyan 深青、darkgray 深灰、darkgreen深绿、dakmagenta 深紫、darkred 深红、defaultcolour默认颜色、green 绿色、lightgray浅灰、magenta 紫红、red 红色、rgb 自定义颜色、white 白色、yellow 黄色

###### 数据输出与图表中Bar的数量同齐

图表中每个Bar均有数值、布尔或字符串的输出。数值的输出涉及到计算，有时在某些Bar上可能为无效值。如：PlotNumeric(“avgvalue”,averageFC(close,5));该公式在图表数据的前4个Bar上都是无效值，第5个Bar之后每个Bar才会有计算得出的有效平均数值的输出。

注意：在图表整个Bar数据序列上，可能因为计算、条件等因素，从而在Bar数据中输出无效值，遇到此类情况可能会导致数据输出在图表上的整体图型很奇怪。所以，输出数据之前可在公式中加上判断语句，保证在非无效值的情况下才输出数据。

例：

~~~cpp
if(aaa != InvalidNumeric) PlotNumeric("tt",aaa,0,red);
~~~

###### 条件Bar下的数据输出

在指定条件下输出数据，不符合条件的Bar上则不会有任何输出。

例：判断无效值则不输出

~~~cpp
if(aaa != InvalidNumeric) PlotNumeric("tt",aaa,0,red);
~~~

例：对某种K线型态的标识或者突破点的标注。

   ~~~cpp
if(open>close) PlotNumeric("tt",high,low,yellow);
   ~~~

指定条件只有为下跌收盘的Bar上方可输出一条黄色的高低点柱状连线。如下图所示：

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_021.png" width="750"/>

###### 偏移N个Bar的输出

三个输出函数最后一个参数均是BarsBack，此参数的意义是将值回溯N个Bar输出。需要注意的是，若此N值为正数，则是将输出值向左移N个Bar输出，若N值为负数，则是将输出值向右偏移N个Bar输出。

例：比较两种不同偏移的输出结果：

~~~cpp
if(open > close) PlotNumeric("tt",high,low,yellow,2);
if(open > close) PlotNumeric("tt",high,low,yellow,-1); 
~~~

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_022.png" width=""/>

注意：第一种写法在历史分析中相当于使用了未来数据，请慎重考虑此写法是否符合实际需求，此处仅作为比较偏移取值不同的显示效果示例。实时行情中，每一次的运算只计算最新Bar上的Tick，所以当最新K线数据满足条件后，只有再手工刷新图表，才会对历史K线上按条件进行画线。

第二种写法在最新K线出来之前，无法在图表上画出前一个Bar 所输出的数据线。因为交易开拓者的图表上，画线的前提条件是有Bar数据。

##### UnPlot 

UnPlot-----删除输出函数曾经输出的值。

语法：

~~~cpp
Unplot(String Name,Integer BarsBack =0)
~~~

参数说明：

Name 要删除输出值的名称，不区分大小写；

BarsBack 从当前Bar向前回溯的Bar数，默认值为0，表示删除当前Bar曾输出的值。

例：

~~~cpp
Params
	Numeric length1(10);
	Numeric length2(20);
Vars
	Numeric ma1;
	Numeric ma2;
	Numeric i;
events
OnBar(ArrayRef<Integer> indexs)
{
MA1 = AverageFC(Close,Length1);  
	MA2 = AverageFC(Close,Length2);
	PlotNumeric("MA1",MA1);
	PlotNumeric("MA2",MA2);
	If(BarStatus==2)
	{
		for i =0 to 5
		{
			Unplot("ma1",i);
		}
		PlotNumeric("ma1",close);	
	}
}
~~~

本例的功能是输出两条移动平均线，把其中MA1均线的最后6个K线上的输出值删除，并在后一个K线输出一个新值。结果如下图所示：

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_023.png" width=""/>



【问题】为什么使用PlotNumeric输出线条，在属性中设置了线型设置，实际显示却是混乱的

例：

~~~cpp
If (condition1)
 {Plotnumeric("t1",L[3],L[3],-1,3);//公式属性里线型选柱状图
 }
If (condition2)
 {Plotnumeric ("t2","2",O-50);//公式属性里线型选线
 }
~~~

表现：Bar满足condition1但不满足condition2，图表中在L[3]显示黄粗圆点；如果t2公式属性里线型选点，黄粗圆点变成了红圈方白点。（线型中还有其他设置，这里的意思就是线型没有按照设置的显示，具体表现情况不尽相同）

【回答】这个问题的关键在于线型不是直接输出，而是满足某种条件输出。这样，在图表上输出线型的顺序与属性里显示的线型设置的序列可能不同，于是出现了混乱情况。遇到这种问题，建议将一定会在每个bar上都出现的线型写在前面，需要判断条件才输出的写在最后。如果条件输出的结果不能保障出现的顺序，可以改成几个不同的公式来执行，实现不同线型的需求。

##### PlotKline

PlotKline-----在当前Bar输出一个K线。可用于在子图中输出价差K线(需在公式属性中，设置“显示方式”为子图)。

语法：	

~~~cpp
PlotKline (Numeric Open, Numeric High, Numeric Low, Numeric Close)
~~~

参数说明：

Open输出K线的开盘价的值；

High输出K线的最高价的值；

Low 输出K线的最低价的值；

Close输出K线的收盘价的值。

例：

例1：PlotKline(100, 110, 93, 107); 

输出RSI的值。

例2：PlotKline(Open-100,High-100,Low-100,Close-100);

在当个k线100个点下，输出相应K线。

##### PlotDic

PlotDic-----在当前Bar的输出信息中添加基础数据信息。

参数说明：

DicRef<Numeric>、DicRef<Array<Numeric>>、DicRef<Array<Array<Numeric>>>、  DicRef<Integer>、DicRef<Array< Integer >>、DicRef<Array<Array< Integer >>>、DicRef<Bool>、DicRef<Array< Bool >>、DicRef<Array<Array< Bool >>>、DicRef<String>、DicRef<Array< String >>、DicRef<Array<Array< String >>>需要输出的基础数据引用

Integer dIconType(-1);  //输出值的图形类型

Numeric dLocator(0);  //输出值的定位点 

Integer lColor(-1);  //输出值的显示颜色，默认表示使用属性设置框中的颜色 

Integer lBack(0);  //当前Bar向前回溯的Bar数，默认值为当前Bar

例：

~~~cpp
Vars
   Dic<Numeric> xdxr_price("TB_XDXR_price");
   Dic<Numeric> xdxr_profit("TB_XDXR_profit");
   Dic<Numeric> xdxr_ration("TB_XDXR_ration");
   Dic<Numeric> xdxr_scrip_issue("TB_XDXR_scrip_issue");
events
   OnBar(ArrayRef<Integer> indexs)
   {
     if(BarStatus == 1)
     {
        xdxr_price[0];
        xdxr_profit[0];
        xdxr_ration[0];
        xdxr_scrip_issue[0];
      }
      PlotDic(xdxr_price);
      PlotDic(xdxr_profit);
      PlotDic(xdxr_ration);
      PlotDic(xdxr_scrip_issue);
    }
~~~

在合约的k线图表上加载该公式，有基础数据的bar上显示* 标记，点击*，弹出该bar对应的基础数据窗。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_024.png" width=""/>

##### Plotauto

在TBQuant里面为了使得输出画图函数设置更加方面，也为了使得输出函数名字统一，所以使用新的输出函数plotauto替代原来三个函数。并且在原来三个函数的参数基础上增加了plotauto函数的参数（类型，风格，宽度等）。但是不同的数据类型必须使用不同的参数，这个需要特别注意。

对应plotnumeric类型的输出：plotauto的参数

参数说明：

String strName;  //输出值的名称，不区分大小写

Numeric dVal;  //输出的数值

Numeric dLocator(0);  //输出值的定位点

Integer lLineType(-1);  //设定画线类型 Enum_Dot、 Enum_Line、 Enum_Bar、Enum_Cross 枚举函数指定 默认为属性框中设定

Integer lLineStyle(-1);  //设定画线风格 Enum_Solid、Enum_Dash、Enum_Broken、Enum_Dash_Dot枚举函数指定 默认为属性框中设定

Integer lLineWidth(-1);  //设定画线线宽 Enum_1Pix、Enum_2Pix、Enum_3Pix、Enum_4Pix、Enum_5Pix、Enum_6Pix、Enum_7Pix枚举函数指定 默认为属性框中设定

Integer lColor(-1);  //输出值的显示颜色，默认表示使用属性设置框中的颜色

Integer lBack(0);  //当前Bar向前回溯的Bar数，默认值为当前Bar

使用案例：

~~~cpp
events
OnBar(ArrayRef<Integer> indexs)
{

PlotAuto("OpenToClose",open,close,Blue,Enum_Line,Enum_Solid,Enum_2Pix);
}
对应plotbool类型的输出：plotauto的参数
~~~

参数说明：

String strName;  //输出值的名称，不区分大小写

Bool bVal;  //输出的布尔值

Numeric dLocator(0);  //输出值的定位点

Integer lColor(-1);  //输出值的显示颜色，默认表示使用属性设置框中的颜色

Integer lIconType(-1);  //输出值的显示图形，默认显示系统笑脸

Integer lBack(0);  //当前Bar向前回溯的Bar数，默认值为当前Bar

使用案例：

~~~cpp
events
OnBar(ArrayRef<Integer> indexs)
{

PlotAuto ("con",con,high); //在bar的最高价位置输出条件con的布尔值。
}
对应plotstring类型的输出：plotauto的参数
~~~

参数说明：

String strName;  //输出值的名称，不区分大小写

String strVal;  //输出的字符串

Numeric dLocator(0);  //输出值的定位点

Integer lColor(-1);  //输出值的显示颜色，默认表示使用属性设置框中的颜色

Integer lBack(0);  //当前Bar向前回溯的Bar数，默认值为当前Bar

使用案例：

~~~cpp
events
OnBar(ArrayRef<Integer> indexs)
{

PlotAuto("Bear Market","Bear Bear",high,blue); //在bar的最高价位置输出一个字符串，并且显示为蓝色。
}
~~~

##### Print函数在控制台的输出

在TBQuant里面K线右侧增加了控制台，可以使用Print(string)函数输出内容到控制台。
比如写这样一个公式：print二维数组的内容到右侧控制台。

~~~cpp
Vars
    Global Array<Array<Numeric>> a;
    Global Numeric i;
    Global Numeric j;
Events
OnInit()
{
    for i=0 to 10
    {
        for j=0 to 10
        {
            a[i][j]=i+j;
        }
    }
}
OnBar(ArrayRef<Integer> indexs)
{
    Print(TextArray(a));
}
~~~

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_025.png" width=""/>



### 1.7 用户函数

函数是TB语言中一类非常重要的语言元素，实现数据的加工计算。函数一般有参数，数据的传入通过函数声明的各个参数，把函数的参数值代入函数供计算机处理；函数必须有返回值，函数计算得出结果之后，返回数值到调用它的程序。

函数分为系统函数和用户函数，顾名思义，系统函数是由系统提供的，而用户函数则是用户根据需求自己编制的。

系统函数详细说明参见<a href="http://www.tbquant.net/fun.html" target="_blank">系统函数</a>。

用户函数是通过名称进行调用的一组语句的集合，它具有特定的功能，执行结束后有返回值。在公式中如果需要使用某个函数相应的功能，调用函数即可，无需重新编写代码。

#### 1、用户函数的类型

1、按照返回值类型分类

数值型(Numeric)

布尔型(Bool)

字符串(String)

整数型(Integer)

用户函数在调用时需要将返回值赋予类型相同的变量。

2、按照用户函数的实现机制分类

普通函数：输入参数，执行一段程序代码，返回需要的值

序列函数：输入参数或变量中有序列数据的用户函数

序列函数是一种特殊的用户函数，它的参数或变量中使用了序列数据。引入序列数据是TB语言和普通计算机语言的重要区别，是进行金融序列数据计算的核心。为了保证序列数据的正确计算，序列函数需要每个Bar都被调用，如果有些Bar没有调用序列函数，序列函数中的序列数据沿用上一个Bar的值。因此，除非是算法需要，否则建议不要在条件语句、条件语句的判断表达式、循环语句中使用序列函数。

#### 2、TB软件中用户函数使用规则

参数支持基本数据类型和容器扩展类型，支持指定参数默认值；

支持使用引用参数，可通过引用参数返回多个数据；

变量支持类型，支持指定变量的默认值；

可以访问Data0-Data99个数据源的Bar数据，通过数据源数组data访问的数据源个数不受限制；

可以访问行情数据、属性数据；

必须通过Return返回数据，返回数据类型为四种基本类型之一；

脚本中的返回数据类型必须和函数属性界面设置中一致；

用户函数之间可以相互调用，用户函数自身也可以递归调用，用户函数可以调用所有的系统函数，包括交易动作和技术分析输出。

#### 3、函数的编写

用户函数同公式应用一样，其实体由三部分组成：参数声明，变量声明，脚本正文。

参数声明和变量声明参照TB语言基础相关内容；

脚本正文部分是编写实现函数功能的代码部分，它将函数的参数值代入代码进行计算，得出函数的返回值，通过Return返回。

例：编写Average1函数，Average1函数的功能是计算Price在Length周期内的平均值。

编写步骤：

首先，新建用户函数，定义函数的名称Average1；

在导航页上打开【公式管理】应用工作区“<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_026.png" width=""/>”，单击新建用户函数按钮“<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_027.png" width=""/>”打开新建函数的窗口，进行下图所示的设置：

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_028.png" width=""/>

2.  单击“确定”按钮，打开公式编辑器，输入代码：

  a)	声明参数：Price，Length；

  b)	声明变量AvgValue保存函数的计算结果，类型为Numeric（与返回值类型一致）；

  c)	编写具体实现功能的代码：调用Summation求和，并计算平均值，返回结果。

3.  点击工具栏的编译公式按钮“<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_029.png" width=""/>”编译保存当前函数。

  Average1函数脚本如下：

  ~~~cpp
  Params
      Series<Numeric> Price(1);
      Numeric Length(10);
  Vars
      Numeric AvgValue; 
  Events
  OnBar(ArrayRef<Integer> indexs)
  {
      AvgValue = Summation(Price, Length) / Length;    
      Return AvgValue;
  }
  ~~~

  本例只有一个返回值，即最后求得的平均值，在函数中直接使用Return 语句返回即可。

  注意：如果函数需要多个返回值，不可使用多条Return语句，可以将其他需要返回值的变量定义为引用型参数，即***Ref类型，这种类型的参数变量可以将其在函数内部中的改变直接传递出去。

  例：求N周期最大值。假定需要编写的用户函数功能需求为：求出序列变量Price在最近Length周期内的最大值，并且求出最大值出现的Bar与当前Bar的偏移量。

  函数脚本如下：

  ~~~cpp
  Params
      Series<Numeric> Price(1);
      Numeric Length(10);
      NumericRef HighestBar;  //设置引用型的变量
  Vars
      Numeric MyVal; 
      Numeric MyBar;
      Numeric i; 
  Events
  OnBar(ArrayRef<Integer> indexs)
  {
      MyVal = Price;
      MyBar = 0;
      For i = 1 to Length-1
      {
          If ( Price[i] > MyVal)
           {
              MyVal = Price[i];
              MyBar = i; //记录最大值Bar与当前Bar的偏移量
          }
      }
      HighestBar = MyBar;  //将偏移量赋值给引用型变量，将该值传递回去
      Return MyVal; //返回计算得到的最大值
  }
  ~~~

#### 4、用户函数的调用

语法格式：

变量名=函数名(<参数列表>)；

说明：

用户函数成功创建之后（编译/保存成功），可以在其他的用户函数、公式应用中调用；

函数调用时，函数如果有参数一定要加()，参数列表中的参数个数、类型要一一对应、匹配；如果没有参数，()可以省略；

注意保持参数类型的匹配，即用户函数参数的声明数据类型需和调用时传入参数的数据匹配。

函数参数声明为引用类型时，可传入的变量类型不包括序列类型。譬如函数参数声明类型为NumericRef 时，不可传入Series<Numeric>数据类型。

函数参数声明为其它类型时，可传入同类型的所有扩展类型。

公式中变量定义的数据类型和函数的返回值类型一致

其他公式、函数中调用函数时，可将获得返回值的变量的数据类型定义为函数返回值同种类型的扩展类型。例如：函数返回值为Numeric，可以赋给公式中类型为Series<Numeric>或NumericRef的变量。

函数内可以调用其它数据源的内嵌系统函数，如在函数Data0.Average的代码中可以使用Data1.Close。

​    例：在公式中调用Average1函数，求最近10个周期的Close的平均值。

​	方法一：

~~~cpp
Vars
    Numeric Value1;
Begin
    Value1 = Average1(Close,10);
End
~~~

方法二：

~~~cpp
Vars
    Series<Numeric> Value1;
Begin
    Value1 = Average1(Close,10);
End
~~~



### 1.8 公式应用

公式应用是用户编写交易策略主体代码的模块。本文从公式函数、技术分析类、交易策略类和公式报警四个方面介绍下公式应用的使用。

#### 1、公式函数Defs

TBQuant升级了公式运行机制为事件驱动机制以后，除了可以定义用户函数外，在用户公式里面，也可以定义函数，这里的函数是公式函数，统一定义在Defs的域内。

对于公式函数可以使用的参数类型是最为广泛的，可以参照数据类型的说明。

关于公式函数的使用有几点需要注意：

1）公式函数的参数不需要事先定义；

2）公式函数只可以在当前公式中使用，在其它公式中需要重新定义。

3）defs同样支持数据源的调用比如data[i].func()，func是defs类型的函数。

#### 2、技术分析类

技术分析是公式应用最常用的功能，它通过计算一系列的数学公式，在每个Bar都返回值，这些值在图表模块中输出为线条、柱状图、点等表现形式，通过分析图形特点、趋势和曲线帮助客户分析行情走势，得出合理的交易判断。

##### 模板介绍

新建技术分析类的公式应用，在新建公式应用的模板里选择“技术分析”，打开之后如下图所示。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_030.png" width=""/>



模板里有现成的两个变量的声明、赋值以及输出，以及一个条件输出报警的语句。用户可以根据自己的需求来进行添加、修改与完善公式并进行编译。

##### 编写思路

首先，确定指标里需要的信息及计算方式；

然后，在公式中进行相应的定义和计算；

最后，将计算结果以数值、布尔或字符串的形式在图表上输出。

##### 注意事项

1）指标的输出属性可以在属性设置中进行相应设置；

2）指标是在主图显示还是在子图显示；

3）指标的线型；

4）如果公式在多数据源上运行，公式中与数据源有关的变量和函数需显式调用。若不显示数据源则默认其数据源为Data0。如技术分析模板中的代码在多数据源上运行时，需写成如下的形式：

~~~cpp
Params
      Numeric FastLength(5); 
      Numeric SlowLength(20);
Vars
      Series<Numeric> AvgValue1; 
      Series<Numeric> AvgValue2;
Events
OnBar(ArrayRef<Integer> indexs)
{
      Range[0:1]
      {
        AvgValue1 = AverageFC(Close,FastLength);
        AvgValue2 = AverageFC(Close,SlowLength);
        PlotNumeric("MA1",AvgValue1);
        PlotNumeric("MA2",AvgValue2);
        if (AlertEnabled && CrossOver(AvgValue1, AvgValue2)
        {
            Alert("Do Alert Now");
        }                    
    }                        
  }
~~~

#### 3、交易策略类

当我们在公式应用中编写了完整的开平仓规则以及、头寸控制、风险控制等代码，我们称之为交易策略，交易策略是我们一个独立交易思想的完整体现。

##### 模板介绍

新建交易策略类的公式应用，在新建公式应用的模板里选择“交易策略”，打开之后如下图。

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_031.png" width=""/>

模板里已经设置好了两个参数，两个布尔变量（用于保存开平仓的条件），两个条件语句（用于开平仓）。用户可以根据实际策略的需求，调整变量、条件与计算的数量，判断交易的入场点与出场点，在图表上对买卖点做出标识。

如果用户已经熟悉了TB公式编写的方法，新建公式应用时可不选择任何模板，直接选择“空”模板，打开空白的编辑器，自行编写语句。

##### 交易函数

###### 1) Buy，SellShort，BuyToCover，Sell

语法格式：

~~~cpp
Bool  Buy(Numeric Share=0,Numeric Price=0)

Bool  BuyToCover(Numeric Share=0,Numeric Price=0)

Bool  Sell(Numeric Share=0,Numeric Price=0)

Bool  SellShort(Numeric Share=0,Numeric Price=0)

~~~

参数说明：

Share 数量，为整型值，默认值为0表示使用系统设置参数；

Price 价格，为浮点数，默认值为0表示使用现价(非最后Bar为Close)。

Buy ---- 对当前合约发出买入开仓的指令，如果图表讯号显示当前持有空仓，则会先平掉空仓，再开多仓；

SellShort ---- 对当前合约发出卖出开仓的指令，如果图表讯号显示当前持有多仓，则会先平掉多仓，再开空仓； 

BuyToCover ---- 对当前合约发出平空仓的指令，当图表讯号显示有空头持仓时，方可执行此指令；

Sell ---- 对当前合约发出平多仓的指令，当图表讯号显示有多头持仓时，方可执行此指令。

例：判断条件，执行买入或者卖出的动作，并在图表上标识出讯号

代码如下：

~~~ cpp
if(condition1 && marketposition<>1)     //条件满足且没有持多仓情况下开多
		{
  			buy();
		}else if(condition2 && marketposition!=-1)  //条件满足且没有持空仓时开空
		{
			sellshort();
		}
~~~

###### 2) MarketPosition

MarketPosition-----获得当前持仓状态。

语法格式：

~~~cpp
Integer MarketPosition()
~~~

返回值说明：

-1 当前位置为持空仓

0 当前位置为持平

1 当前位置为持多仓

###### 3) A_SendOrder

A_SendOrder()与枚举函数配合使用，直接对帐户进行发送指令的动作（开空、开多、平空、平多）。

A_SendOrder()仅在实时行情中最后一个Bar上针对当前帐户操作，不能在图表中标识买卖讯号，也不能进行历史回溯测试。

语法：

~~~cpp
Bool  A_SendOrder(Integer BuyOrSell,Integer EntryOrExit,Numeric fLot,Numeric fPrice) 
~~~

针对当前公式应用的帐户、商品发送委托单，发送成功返回True,发送失败返回False。 

参数： 

BuyOrSell 发送委托单的买卖类型，取值为Enum_Buy(买入)或Enum_Sell(卖出)之一； 

EntryOrExit 发送委托单的开平仓类型，取值为Enum_Entry(开仓),Enum_Exit(平仓),Enum_ExitToday(平今仓)之一； 

fLot 委托单的交易数量； 

fPrice 委托单的交易价格。  

下表为A_SendOrder函数使用示例：

| 参数1： 买卖    | 参数2：开平              | 参数3：数量            | 参数4：价格  | 示 例                                             |
| --------------- | ------------------------ | ---------------------- | ------------ | ------------------------------------------------- |
| 1.开多Enum_Buy  | Enum_Entry               | 5                      | Q_AskPrice() | A_SendOrder(Enum_Buy,Enum_Entry,5,Q_AskPrice());  |
| 2.平多Enum_Sell | Enum_Exit,Enum_ExitToday | 5  or A_BuyPosition()  | Q_BidPrice() | A_SendOrder(Enum_Sell,Enum_Exit,5,Q_BidPrice());  |
| 3.开空Enum_Sell | Enum_Entry               | 开空仓单5手            | Q_BidPrice() | A_SendOrder(Enum_Sell,Enum_Entry,5,Q_BidPrice()); |
| 4.平空Enum_Buy  | Enum_ExitEnum_ExitToday  | 5  or A_SellPosition() | Q_AskPrice() | A_SendOrder(Enum_Buy,Enum_Exit,5,Q_AskPrice());   |

A_SendOrder()函数直接发单，无需任何确认，在实时行情中，每个Tick都会触发程序的运行，因此，使用A_SendOrder()函数需要根据仓位头寸并配合全局变量进行条件处理，避免造成重复发单。

【问题】buy、sellshort与A_sendorder有什么区别？

【回答】buy、sellshort在图表上标识买卖信号，与k线、行情数据有关，可用于历史回测及实时交易，该函数同一个bar不会重复发单（TB底层保证）。marketposition依据图表信号判断当前持仓情况，该值不与账户关联，不能反应账户实际的持仓情况。

 A_sendorder与账户关联，交易不在图表上产生信号，不能用于历史回测，仅对实时行情有效。使用此函数进行交易，需要额外增加头寸判断的条件语句，避免重复发单。

【补充】交易函数匹配

- MarketPosition与Buy，SellShort， BuyToCover，Sell匹配

​        图表持仓情况：根据图表持仓情况判断开仓及控制仓位

- A_sendorder与A_TotalPosition，A_BuyPosition，A_SellPosition匹配

​       账户持仓情况：根据账户持仓情况，判断开仓及控制仓位

##### 编写思路

交易，有买有卖方可形成交易。所以一次完整的交易，必须要有开仓以及平仓的动作。

首先，理顺思路，将交易规则转化为相关的条件语句表达式，确立策略中的交易头寸及要采用的参数和变量；

然后，确定需要使用的交易命令；

最后，在公式中进行相应的定义，完成策略实现代码。

示例，以下是一个双均线交易策略的代码：

~~~cpp
Params
    Numeric FastLength(5);
    Numeric SlowLength(20);
    Numeric BuyLots(1);
Vars
    Series<Numeric> AvgValue1;
    Series<Numeric> AvgValue2;
events
OnBar(ArrayRef<Integer> indexs)
{
    AvgValue1 = AverageFC(Close,FastLength);
    AvgValue2 = AverageFC(Close,SlowLength);
    If(MarketPosition!=1 And (AvgValue1[1] > AvgValue2[1]))
    {
        Buy(BuyLots,Open);
    }
    If(MarketPosition!=-1 And (AvgValue1[1] < AvgValue2[1]))
    {
        SellShort(BuyLots,Open);
    }
}
~~~

为了在上面交易策略在超级图表中执行同时看到两条均线的数值，我们也可以在交易策略中输出指标线条，只需要增加以下两行代码：

~~~cpp
  PlotNumeric("MA1",AvgValue1);
  PlotNumeric("MA2",AvgValue2);
~~~

除了希望看到两条均线值之外，我们还希望能够在超级图表中看到交易策略的盈亏曲线，这时我们需要再增加一条指标线:

  ~~~cpp
  PlotNumeric("OpenEquity",Portfolio_TotalProfit);
  ~~~

###### 策略的头寸

直接指定交易头寸，如果指定头寸为0，则系统自动按1手处理。

使用参数（如上述DualMA双均线案例）

根据资产具体情况以及交易要求计算得出

定义变量，通过对资产、行情等条件的计算以及其它的判断条件确定交易的数量。

例：交易开拓者软件的系统公式里自带的“海龟交易系统”

~~~cpp
AvgTR = XAverage(TrueRange,ATRLength);
N = AvgTR[1];	
TotalEquity = Portfolio_CurrentCapital() + Portfolio_UsedMargin();
TurtleUnits = (TotalEquity*RiskRatio/100)/(N *ContractUnit()BigPointValue());
TurtleUnits = IntPart(TurtleUnits); // 对小数取整
~~~

###### 计算公式

头寸规模 = 账户净值的1%/价值量波动性

账户净值 = 可用资金 + 持仓保证金（全局交易里设置）

价值量波动性 = N*每点价值量

N = 真实波动幅度的20周期指数移动平均值（XAverage）

通过一系列的计算，在不同的行情与资金状态下，计算得出的开仓数量也不尽相同。

###### 程序调试

公式代码编写完毕，单击编译保存按钮对公式进行编译。简单语法错误，可以根据编译提示信息进行修改，如果出现逻辑错误，导致公式不能得到所需的运行结果，则需要在代码中添加调试语句，检查出错的原因。常用的调试语句有Commentary和FileAppend。

Commentary

Commentary ----在超级图表当前Bar添加一行注释信息。

该函数无返回值，作为系统调试的辅助工具，双击超级图表出现十字光标后，在工具栏选择“显示提示框”，这样便可以看到任意Bar上的注释信息了。

例：

~~~cpp
If(close>open)
        Commentary("收阳="+Text(close));  //在收阳的K线上显示收盘价
~~~

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_032.png" width=""/>

如上图显示，在信息提示窗口里可以看到Commentary语句里显示的注释内容。上例所写的是条件下输出，只有在满足if()语句内的条件Bar上方可显示此内容，不满足条件的Bar上则不会有注释信息的输出。

当然，如果没有条件语句来约束 Commentary，则在图表上的每个Bar上都输出注释信息。采用这种方式可以方便交易者观察图表上的数据情况，对公式策略进行适当的调试。

例如：

~~~cpp
 Commentary(“开仓价格”+(symbol)+”=”+text(entryprice));
   Commentary(“满足多头开仓”);
~~~

Commentary显示的注释信息仅在图表中标识，如果需要生成记录文件，则要使用函数FileAppend

FileAppend

FileAppend ----在指定文件中追加一行字符串，返回值为布尔型。执行成功返回True，执行失败返回False。

语法：

~~~cpp
Bool FileAppend(String strPath,String strText)；
~~~

参数：strPath 指定文件的路径，请使用全路径表示，并使用 \\\\ 做路径分割符，否则会执行失败；strText 输出的字符串内容。

FileAppend 的调试信息不会在图表上标识，而是写入一个文件中。每一次执行到这个语句，便会在文件中写入一条调试信息，方便交易者查找调试。

注意：文件名后缀一般使用tbf格式。文件的内容在数据中心进行查看。

例如：

~~~cpp
FileAppend("d:/series.tbf","time="+TimeToString(Time)+",data0.value1="+Text(data0.Value1)+",data1.value1="+Text(data1.value1));
~~~

<img src="https://tb-institute.oss-cn-shanghai.aliyuncs.com/TBL/img/02_01_033.png" width=""/>

上述语句，没有添加任何条件直接输出，实时行情中因为每个Tick程序都会运行一次，所以同一个Bar上会输出多条调试语句的结果。用户可以通过查看这些结果找到自己所需要的信息。

如果在条件语句下输出FileAppend，则条件满足之后才会有调试语句写入文件。

【注意事项 】

- 开、平仓指令成对出现；

- 加仓时注意在全局交易设置中勾选允许连续建仓；

- 使用A_SendOrder函数发单，注意重复发单的机制。


#### 4、公式报警

TB的公式提供Alert、AlertEnabled函数实现公式报警功能。

可以在用户函数或公式应用中按照以下方式来编写自己的报警:

~~~ cpp
Vars
    Bool Condition1;
Events
OnBar(ArrayRef<Integer> indexs)
{

    //Condition1 = 您设定的条件表达式;
    If(AlertEnabled AND Condition1)
    {
        Alert("报警信息...");
    }
}
~~~

AlertEnabled

参见[AlertEnabled](http://www.tbquant.net/fun/257.html)。

Alert

参见[Alert](http://www.tbquant.net/fun/249.html)。



### Plot帮助文档

#### 1、Plot定义

#####1.1 背景
-  画布
   -  有多个画板组成
   -  画板之间相互独立
   -  画板之间只有布局关系
   -  画板之间可以分组，相同分组X坐标轴可以联动
-  画板
   -  有多个图形组成，分别是一个主图，多个附图
   -  有共同的一个坐标轴
   -  图形之间是叠加关系
   -  生成主坐标的图形，称为主图(或父图)
   -  叠加在主图上的图形，称为附图(或子图)
#####1.2 定义
- Plot表示画图对象
- 可以重复使用画图、设置坐标、属性等
- 可以定义画板内的叠加关系
- 可以定义画布内的布局关系
- 公式定义

~~~cpp
Vars
  Plot  plt;	
~~~



#### 2、画板定义

##### 2.1 定义
-  Figure表示一个**画板**
~~~cpp
figure();
~~~
-  参数			

| 参数|类型|说明|
| ------- | ------ | ------|
| groupid |整型 |画板分组ID |

~~~cpp
plt.figure();
~~~

##### 2.2 重定向

- redirect

  ~~~cpp
  redirect(String component,String name);
  ~~~

- 参数

  | 参数      | 类型   | 说明                                          |
  | --------- | ------ | --------------------------------------------- |
  | component | String | 组件名称，目前只支持table可以重定向'量化看盘' |
  | name| String | 组件实例名称 |
  
  ~~~cpp
  plt.redirect('量化看盘');
  ~~~

##### 2.3 主图

-  Plot本身不代表是否为主图或附图
-  Plot可以重复使用
-  主图：画板第一个输出的图形，且决定X、Y轴，即为主图

##### 2.3 附图
-  附图：叠加到主图上的图形，不能定义X、Y，这也是与主图的最大差别
-  实现：
  -  subplot：把附图对象叠加到主图对象上
  -  使用同一个Plot，也可以叠加
  -  childPlt不能是figure，即不是独立画板
~~~cpp
childPlt.subplot(parentPlt);
~~~

-  参数			

| 参数|类型|说明|
| ------- | ------ | ------|
| parentPlt |Plot对象 |主图对象 |

#####2.4 示例
~~~cpp
Vars
  Plot parentPlt1;//主图
  Plot parentPlt2;//主图
  Plot childPlt;//附图
  Array<Numeric> xData;//x轴数据集
  Array<Numeric> yData;//y轴数据集
Events
  OnInit()
  {
     parentPlt1.figure(); //独立画板
     parentPlt2.figure(); //独立画板
     parentPlt1.setOption("MA1","x-format","time");//设置X为时间轴
     parentPlt2.setOption("MA2","x-format","time");//设置X为时间轴
     childPlt.subplot(parentPlt1);//childPlt叠加到parentPlt1主图上显示
     childPlt.subplot(parentPlt2);//childPlt叠加到parentPlt2主图上显示
  }
  OnBar(ArrayRef<Integer> indexs)
  {
     xData[0] = date+time;
     yData[0] = AverageFC(Close,5);
     parentPlt1.line("MA1",xData,yData);
     parentPlt2.line("MA2",xData,yData);
     yData[0] = AverageFC(Close,10);
     parentPlt1.line("MA11",xData,yData);//同一个Plot叠加
     childPlt.line("MA3",date+time,AverageFC(Close,20));//subplot叠加
  }
~~~

##### 2.5 K线

######2.5.1 叠加
-  K线默认为主图，  不需要显示设置Figure()
-  附图如果没有显示调用subplot，则默认叠加到k线所在主图

######2.5.2 示例
~~~cpp
Vars
	Plot  plt1;//主图
	Plot  plt2;//附图
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
Events
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = AverageFC(Close,5);
		plt1.line("MA1",xData,yData);
		
		yData[0] = AverageFC(Close,10);
		plt2.line("MA2",xData,yData);
	}
~~~



#### 3、属性设置

##### 3.1 属性函数
~~~cpp
plt.setOption(name,option,value);
~~~

-  参数

| 参数   | 类型   | 说明                                             |
| ------ | ------ | -----------------------------------------------|
| name   | String | 图形名称，建议只要只用字符、数字、下划线组成 |
| option | String | 属性名称                               |
| value  | String/Numeric/Integer | 属性值，根据不同的属性对应相应的值类型 |

##### 3.2 设置颜色

######3.2.1 定义
-  属性名： "color"
-  属性表
| 属性值    | 类型 | 说明    |
| --------- | ---- | ------- |
| Black | 枚举 | 黑色 |
| Blue  | 枚举 | 蓝色 |
| Red  | 枚举 | 红色 |
| White  | 枚举 | 白色 |
| Yellow  | 枚举 | 黄色 |
| N  | 数值 | ARGB值 |

###### 3.2.2 示例

```cpp
Vars
	Plot  plt1;
	Plot  plt2;
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
Events
	OnInit()
	{
		plt1.setOption("MA1","color",White);//将指标“MA1”的输出颜色设置为白色
		plt2.setOption("MA2","color",Yellow);//将指标“MA2”的输出颜色设置为黄色
		plt2.figure();//独立画板
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = AverageFC(Close,5);
		plt1.line("MA1",xData,yData);
		plt2.line("MA2",date+time,AverageFC(Close,5));
	}
```

##### 3.3 设置宽度

######3.3.1 定义
-  属性名： "width"
-  属性表
| 属性值    | 类型 | 说明    | 应用场景               |
| --------- | ---- | ------- | ---------------------- |
| Enum_1Pix | 枚举 | 1个像素 | 线、柱状图、字符串、图标 |
| Enum_2Pix | 枚举 | 2个像素 | 线、柱状图、字符串、图标 |
| Enum_3Pix | 枚举 | 3个像素 | 线、柱状图、字符串、图标 |
| Enum_4Pix | 枚举 | 4个像素 | 线、柱状图、字符串、图标 |
| Enum_5Pix | 枚举 | 5个像素 | 线、柱状图、字符串、图标 |
| Enum_6Pix | 枚举 | 6个像素 | 线、柱状图、字符串、图标 |
| Enum_7Pix | 枚举 | 7个像素 | 线、柱状图、字符串、图标 |

#####3.3.2 示例
```cpp
Vars
	Plot  plt1;
	Plot  plt2;
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
Events
	OnInit()
	{
		plt1.setOption("MA1","width",Enum_2Pix);//将指标“MA1”的输出线宽设置为2像素
		plt2.setOption("MA2","width",Enum_5Pix);//将指标“MA2”的输出线宽设置为5像素
		plt2.figure();//独立画板
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = AverageFC(Close,5);
		plt1.line("MA1",xData,yData);
		plt2.line("MA2",date+time,AverageFC(Close,5));
	}
```

##### 3.4 设置风格

######3.4.1  定义
-  属性名： "style"
-  属性表
| 属性值        | 类型   | 说明       | 应用场景 |
| ------------- | ------ | ---------- | -------- |
| Enum_Solid    | 枚举   | 实线       | 线       |
| Enum_Dash     | 枚举   | 虚线       | 线       |
| Enum_Broken   | 枚举   | 破折线     | 线       |
| Enum_Dash_Dot | 枚举   | 点划线     | 线       |
| “candel”      | 字符串 | 蜡烛图     | K线      |
| “hollow”      | 字符串 | 中空蜡烛图 | K线      |
| “amer”        | 字符串 | 美国线     | K线      |
| “close”       | 字符串 | 收盘线     | K线      |

######3.4.2  示例
```cpp
Vars
	Plot  plt1;
	Plot  plt2;
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
    Array<Bar> klines;
    Bar myKline;
Events
	OnInit()
	{
		plt1.setOption("MA1","style",Enum_Dash);	//将指标“MA1”的输出线风格设置为虚线		
		plt2.setOption("Kline","style","hollow");	//将“Kline”的风格设置为中空蜡烛图
		plt2.setOption("Kline","x-format","time");	//定义为时间轴
		plt2.setOption("MA2","style",Enum_Broken);	//将指标“MA2”的输出线风格设置为破折线
		plt2.figure();//独立画板
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = AverageFC(Close,5);
		plt1.line("MA1",xData,yData);
		
		GetBar(myKline);
		klines[0]=myKline;
		yData[0] = AverageFC(Close,10);
		plt2.kline("Kline",klines);
		plt2.line("MA2",xData[0],yData[0]);
	}
```
##### 3.5 设置线型

######3.5.1  定义
-  属性名： "line-type"
-  属性表
| 属性值     | 类型 | 说明   | 应用场景 |
| --------- | ---- | ------ | ------------ |
| Enum_Dot   | 枚举 | 点     | 画线           |
| Enum_Line  | 枚举 | 线     | 画线           |
| Enum_Cross | 枚举 | 十字线 | 画线           |

######3.5.2  示例
```cpp
Vars
	Plot  plt1;
	Plot  plt2;
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
Events
	OnInit()
	{
		plt1.setOption("MA1","line-type",Enum_Dot);//将指标“MA1”的线型设置为点
		plt2.setOption("MA2","line-type",Enum_Cross);//将指标“MA2”的线型设置十字线
		plt2.figure();//独立画板
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = AverageFC(Close,5);
		plt1.line("MA1",xData,yData);
		plt2.line("MA2",date+time,AverageFC(Close,5));
	}
```

##### 3.6 设置布局

###### 3.6.1 设置上边界
-  属性名： "margin-top"
-  属性表
| 属性值 | 类型   | 说明  | 应用场景 |
| ------ | ------ | ---------- | -----------|
| “-10”  | 字符串 | 以主图层下限向下10等数值个单位为输出图形的上限 | 所有图形 |
| “10”   | 字符串 | 以主图层下限向上10等数值个单位为输出图形的上限 | 所有图形 |
| “-10%” | 字符串 | 以主图层下限向下10%等数值为输出图形的上限 | 所有图形 |
| “10%”  | 字符串 | 以主图层下限向上10%等数值为输出图形的上限 | 所有图形 |
| “high” | 字符串 | 以主图层上限为输出图形的上限            | 所有图形 |
| "low"  | 字符串 | 以主图层下限为输出图形的上限            | 所有图形 |

###### 3.6.2 设置下边界

-  属性名： "margin-bottom"
-  属性表
| 属性值 | 类型   | 说明  | 应用场景 |
| ------ | ------ | ---------- | -----------|
| “-10”  | 字符串 | 以主图层下限向下10等数值个单位为输出图形的下限  | 所有图形 |
| “10”   | 字符串 | 以主图层下限向下10等数值个单位为输出图形的下限  | 所有图形 |
| “-10%” | 字符串 | 以主图层下限向下10%等数值个单位为输出图形的下限 | 所有图形 |
| “10%”  | 字符串 | 以主图层下限向下10%等数值个单位为输出图形的下限 | 所有图形 |
| “high” | 字符串 | 以主图层下限向下10个单位为输出图形的下限        | 所有图形 |
| “low”  | 字符串 | 以主图层下限向下10个单位为输出图形的下限        | 所有图形 |

###### 3.6.3 示例
```cpp
Vars
	Plot  plt;
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
Events
	OnInit()
	{
		
		//指标MA1在主图的[100%,120%]内显示
		plt.setOption("MA1","margin-top","120%");	
		plt.setOption("MA1","margin-bottom","100%");
		
		//指标MA2 不设置边界
		
		//指标MA3在主图的[0%,20%]内显示
		plt.setOption("MA3","margin-top","20%");	
		plt.setOption("MA3","margin-bottom","0%");
		
		//指标Vol在主图的[-20%,0%]内显示
		plt.setOption("Vol","margin-top","0%");	
		plt.setOption("Vol","margin-bottom","-20%");
		
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = AverageFC(Close,5);
		plt.line("MA1",xData,yData);		
		plt.line("MA2",date+time,AverageFC(Close,5));		
		plt.line("MA3",xData,yData);
		plt.barv("Vol",date+time,Vol);
	}
```

##### 3.7、设置坐标轴格式

######3.7.1 定义
-  X轴属性名： "x-format"
-  Y轴属性名： "y-format"
-  属性表
| 属性值 | 类型 | 说明| 应用场景|
| ------ | ---- | -----------| ----------|
| numberic | String | 指定主图x轴数值，也是默认值 | 所有图形|
| numberic_s | String | 指定主图x轴数值，数值是会缩进的(万/亿等) | 所有图形|
| time   | String | 指定主图x轴为时间轴| 所有图形 |

-  说明：k线所在图形，默认值是时间轴，不能修改

#####3.7.2 示例
```cpp
Vars
	Plot  plt1;
	Plot  plt2;
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
Events
	OnInit()
	{
		plt1.figure();//独立画板
		plt2.figure();//独立画板
		plt1.setOption("MA1","x-format","time");//时间格式
		plt1.setOption("MA1","y-format","numeric");//数值		
		plt2.setOption("Vol","y-format","numeric_s");//格式化缩进数值
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = AverageFC(Close,5);
		plt1.line("MA1",xData,yData);		
		plt2.line("Vol",CurrentBar(),Vol);
	}
```

##### 3.8 设置柱状图属性

######3.8.1 填充属性
-  属性名： "fill"
-  属性表
| 属性值 | 类型 | 说明         | 应用场景 |
| ------ | ---- | ------------ | -------------- |
| true   | bool | 柱状图填充   | 柱状图         |
| false  | bool | 柱状图不填充 | 柱状图         |

######3.8.2 描述信息
-  属性名： "bar-descript"
-  属性值：类型为字符串数组，对应每一个柱状图。

######3.8.3 示例
```cpp
Vars
	Plot  plt1;
	Plot  plt2;
    Global Array<Numeric> xData;//x轴数据集
    Global Array<Numeric> yData;//y轴数据集
    Global Array<Numeric> lData;//定位点集
Events
	OnInit()
	{
		//指标Vol在主图的[-20%,0%]内显示
		plt1.setOption("Vol","margin-top","0%");	
		plt1.setOption("Vol","margin-bottom","-20%");
		
		plt2.figure();//独立画板
		
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		ArrayInsert(xData,GetArraySize(xData),date+time);
		ArrayInsert(yData,GetArraySize(yData),Vol);
		ArrayInsert(lData,GetArraySize(lData),Vol/2+CurrentBar%1000);
		If(CurrentBar%5==0)
		{
			plt2.barv("Vol2",xData,yData,lData);//批量
			ArrayClear(xData);
			ArrayClear(yData);
			ArrayClear(lData);
		}		
		plt1.barv("Vol",date+time,Vol,Vol/2+CurrentBar%1000);//单点
	}
```

##### 3.9、设置表格属性

###### 3.9.1 列表头
-  属性名： "x-title"
-  属性值：类型为字符串数组，对应表格的列表头名称

###### 3.9.2 表格属性

| 属性名     | 类型    | 说明 |
| ------------ | ------- | -----------|
| column-index  | String | 设置列位置，0表示索引键值|
|column-precision | String | 设置列精度 |
| column-font-size | String | 设置列字体大小，默认10.5 |
| row-index | String | 设置行位置，从1开始 |
| title-color  | Integer | 设置表头颜色 |

######3.9.3 示例
-  批量更新
```cpp
Vars
	Plot plt1;
	Plot plt2;
	Array<String> titleX;
	Array<Array<Numeric>> tableData;
Events
	OnInit()
	{
		titleX = ["开盘","高价","低价","最新","成交量","持仓量","时间"];		
		plt1.figure();
		plt2.figure();
		plt1.setOption("table1","x-title",titleX);	//设置列头
		plt2.setOption("table2","x-title",titleX);	//设置列头
		plt2.setOption("table2","title-color",Yellow);
		plt2.setOption("table2","key-column","时间");//设置时间所在列为行头，否则自动添加序号
		
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		tableData[0][0] = Open;
		tableData[0][1] = High;
		tableData[0][2] = Low;
		tableData[0][3] = Close;
		tableData[0][4] = Vol;
		tableData[0][5] = OpenInt;
		tableData[0][6] = Date+time;
		plt1.table("table1",tableData);
		plt2.table("table2",tableData);
	}
```
-   动态更新
```cpp
Vars
  Plot plt;
  Array<String> titleX;
  Array<Array<Numeric>> tableData;
  Array<Array<String>> tableData2;
Events
  OnInit()
  {
     titleX = ["开盘","高价","低价","最新","成交量","持仓量","时间"];
     plt.figure();
     plt.redirect("量化看盘");
     //plt.setOption("table","x-title",titleX);//如果设置即定了顺序，否则根据动态更新创建顺序
     plt.setOption("table","title-color",Yellow);
     plt.setOption("table","column-index","时间=0");//设置时间所在列为行头，否则自动添加序号
     plt.setOption("table","column-index","最新=4");//
     plt.setOption("table","column-precision","高价=3");//
     plt.setOption("table","column-font-size","低价=7");//默认10.5
  }
  OnBar(ArrayRef<Integer> indexs)
  {
     plt.table("table","开盘",Text(Open),DateTimeToString(Date+Time));
     plt.table("table","高价",High,DateTimeToString(Date+Time));
     plt.table("table","低价",Low,DateTimeToString(Date+Time));
     plt.table("table","成交量",Text(Vol),DateTimeToString(Date+Time));
     plt.table("table","持仓量",Text(OpenInt),DateTimeToString(Date+Time));
     plt.table("table","最新",Text(Close),DateTimeToString(Date+Time));
  }
```



####4 图形输出

##### 4.1、线形

###### 4.1.1 线形输出
```cpp
plt.line(name,x-axis,y-axis,locator);
```
-  参数
| 参数   | 类型           | 说明         |
| ------ | -------------- | ------------ |
| name   | String        | 线形名称 |
| X-axis | Array\<Numeric\>或Numeric | X轴坐标数组  |
| Y-axis | Array\<Numeric\>或Numeric | y轴坐标数组  |
| locator | Array\<Numeric\>或Numeric | 画图定位点 |

###### 4.1.2 单次输出

```cpp
Vars
	Plot plt1;
	Plot plt2;
Events
	OnInit()
	{	
		plt2.figure();//独立画板
		plt2.setOption("line2","x-format","time");//设置x轴为时间轴
		plt2.setOption("line2","color",Red());//设置颜色
		plt2.setOption("line2","style",Enum_Dash_Dot());//设置线型
		plt2.setOption("line2","width",Enum_2Pix());//设置线宽
		plt2.setOption("line2","y-format","numeric");//数值格式
	}
	
	OnBar(ArrayRef<Integer> indexs)
	{
		if(open > close)
		{
			plt1.setOption("line1","color",green);
			plt2.setOption("line2","color",green);
		}
		else
		{
			plt1.setOption("line1","color",Red);
			plt2.setOption("line2","color",green);
		}
		plt1.line("line1",date+time,(High+Low)/2);
		plt2.line("line2",date+time,(High+Low)/2);
	}
```

###### 4.1.3 批量输出
```cpp
Vars
	Plot plt1;
	Plot plt2;
	Array<Numeric> x1Data;//x轴数据集
    Array<Numeric> y1Data;//y轴数据集
        
    Global Array<Numeric> x2Data;//x轴数据集
    Global Array<Numeric> y2Data;//y轴数据集
	Integer i(0);
Events
	OnInit()
	{
		plt1.figure();//独立画板		
		plt2.figure();//独立画板	
		plt2.setOption("line2","x-format","time");//设置x轴为时间轴
		plt2.setOption("line2","color",Red());//设置颜色
		plt2.setOption("line2","style",Enum_Dash_Dot());//设置线型
		plt2.setOption("line2","width",Enum_2Pix());//设置线宽
	}

	OnReady()
	{
		For i=0 To 1000
		{
			x1Data[i]= i;
			y1Data[i]= Rand(100,150);
		}
		plt1.line("line1",x1Data,y1Data);//批量画图
	}
	
	OnBar(ArrayRef<Integer> indexs)
	{		
		ArrayInsert(x2Data,GetArraySize(x2Data),date+time);
		ArrayInsert(y2Data,GetArraySize(y2Data),(High+Low)/2);
		If(CurrentBar%5==0)
		{
			plt2.line("line2",x2Data,y2Data);//批量
			ArrayClear(x2Data);
			ArrayClear(y2Data);
		}
	}
```

##### 4.2、柱状图

###### 4.2.1 柱状图输出

```cpp
pl.barv(name,x-axis,y-axis,locator);
```
-  参数
| 参数   | 类型           | 说明         |
| ------ | -------------- | ------------ |
| name   | String        | 柱状图名称 |
| x-axis | Array\<Numeric\>或Numeric | X轴坐标数组  |
| y-axis | Array\<Numeric\>或Numeric | y轴坐标数组  |
| locator | Array\<Numeric\>或Numeric | 定位点数组 |

###### 4.2.2 横向柱状图输出(待开发)
```cpp
pl.barh(name,x-axis,y-axis);
```
-  参数
| 参数   | 类型           | 说明         |
| ------ | -------------- | ------------ |
| name   | String        | 柱状图名称 |
| X-axis | Array\<Numeric\>或Numeric | X轴坐标数组  |
| Y-axis | Array\<Numeric\>或Numeric | y轴坐标数组  |

###### 4.2.3 单次输出
```cpp
Vars
	Plot plt1;
	Plot plt2;
	Array<Numeric> x1Data;//x轴数据集
    Array<Numeric> y1Data;//y轴数据集
Events
	OnInit()
	{
		plt1.setOption("bar1","margin-top","0%");	
		plt1.setOption("bar1","margin-bottom","-20%");
		plt1.setOption("bar1","color",Yellow);
		
		plt2.figure();//独立画板		
		plt2.setOption("bar2","x-format","time");//设置x轴为时间轴
		plt2.setOption("bar2","color",Red());//设置颜色
	}
	
	OnBar(ArrayRef<Integer> indexs)
	{
		x1Data[0] = date+time;
		y1Data[0] = Vol;
        
		plt1.barv("bar1",x1Data,y1Data);
		plt2.barv("bar2",x1Data,y1Data);
	}	
```

###### 4.2.4 批量输出
```cpp
Vars
	Plot plt1;
	Plot plt2;
	Array<Numeric> x1Data;//x轴数据集
    Array<Numeric> y1Data;//y轴数据集
     
    Global Array<Numeric> x2Data;//x轴数据集
    Global Array<Numeric> y2Data;//y轴数据集
	Integer i(0);
Events
	OnInit()
	{
		plt1.figure();//独立画板		
		plt1.setOption("bar1","color",Yellow());//设置颜色
		
		plt2.figure();//独立画板	
		plt2.setOption("bar2","x-format","time");//设置x轴为时间轴
		plt2.setOption("bar2","color",Red());//设置颜色
	}
	OnReady()
	{
		For i=0 To 1000
		{
			x1Data[i]= i;
			y1Data[i]= Rand(100,150);
		}
		plt1.barv("bar1",x1Data,y1Data);//批量画图
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		ArrayInsert(x2Data,GetArraySize(x2Data),date+time);
		ArrayInsert(y2Data,GetArraySize(y2Data),(High+Low)/2);
		If(CurrentBar%5==0)
		{
			plt2.barv("bar2",x2Data,y2Data);//批量画图
			ArrayClear(x2Data);
			ArrayClear(y2Data);
		}
	}
```

##### 4.3、文本
-  输出
```
plt.text(name,x-axis,y-axis，texts);
```
-  参数
| 参数   | 类型           | 说明           |
| ------ | -------------- | -------------- |
| name   | String   | 输出名称       |
| X-axis | Array\<Numeric\>或Numeric | X轴坐标数组    |
| Y-axis | Array\<Numeric\>或Numeric | Y轴坐标数组    |
| texts  | Array\<String\> 或 String | 输出的字符串数组 |
-  示例
```cpp
Vars
	Plot  plt1;
	Plot  plt2;
	Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
    Array<String> txtData;//字符串集	
Events
	OnInit()
	{
		plt2.figure();
		plt2.setOption("txt2","x-format","time");
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = Low;
		txtData[0]=Text(CurrentBar);
		plt1.text("txt1",xData,yData,txtData);
		plt2.text("txt2",xData,yData,txtData);
		plt2.setOption("txt2","color",Yellow-CurrentBar);//动态颜色
	 }
```

##### 4.4、表格
-  默认是独立画板，叠加无效
-  表格输出
```cpp
plt.table(name,context);
```

-  参数
| 参数  | 类型                  | 说明     |
| ----- | --------------------- | -------- |
| name  | string                | 表格名称 |
| context | Array<Array\<numeric\>\> | 表格内容 |

-  [3.9.3 示例](#3.9.3 示例)

##### 4.5、K线
-  K线输出
```
pl.kline(name,bars);
```
-  参数
| 参数   | 类型       | 说明     |
| ------ | ---------- | -------- |
| name   | string     | K线名称 |
| bars   | Array\<Bar\>或Bar | K线数据数组  |

-  示例
```cpp
Vars
	Plot  	plt;
	Bar 	myBar;
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
Events
	OnReady()
	{
		plt.figure();
		plt.setOption("kline","x-format","time");//K线不需要显示设置
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		myBar.dateTime=date+time;
		myBar.open=Open()/10;
		myBar.high=High()/10;
		myBar.low=Low()/10;
		myBar.close=Close()/10;
		myBar.volume=Vol()/10;
		myBar.openInt=OpenInt();
		myBar.turnOver=turnOver();
		plt.kline("kline",myBar);
	}
```

##### 4.6、图标
-  Icon输出
```cpp
pl.icon(name,x-axis,y-axis，icons);
```
-  参数
| 参数   | 类型                      | 说明           |
| ------ | ------------------------- | -------------- |
| name   | String                    | 输出名称       |
| x-axis | Array\<Numeric\>或Numeric | X轴坐标数组    |
| y-axis | Array\<Numeric\>或Numeric | Y轴坐标数组    |
| icons  | Array\<String\> 或String  | 图标字符串数组 |

-  映射表
| 参数   | 说明|
| ---- 	| ----------|
| default	|默认		|
| cuowu 	|错误		|
| dengpao 	|灯泡		|
| jiesuo 	|解锁		|
| guanbi 	|关闭		|
| yuanquan |圆圈	|
| suoding 	|锁定		|
| jiage 	|价格		|
| jianshao 	|减少		|
| jinzhi 	|禁止		|
| mubiao 	|目标		|
| nixiang 	|逆向		|
| shoucang 	|收藏		|
| xiangshang|向上		|
| sousuo 	|搜索		|
| zhengque 	|正确		|
| yiwen 	|疑问		|
| renminbi 	|人民币	|
| zengjia 	|增加		|
| xiangxia 	|向下		|
| zhengxiang |正向	|
| jingshi 	|警示		|

-  示例
```cpp
Vars
	Plot  plt1;
	Plot  plt2;
	Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
    Global Array<String> iconDatas;//字符串集
    Array<String> iconData;//字符串集
Events
	OnInit()
	{
		plt2.figure();//独立画板
		plt2.setOption("icon2","x-format","time");
		iconDatas = ["default","cuowu","dengpao","jiesuo","guanbi","yuanquan","suoding","jiage","jianshao","jinzhi","mubiao","nixiang","shoucang","xiangshang","sousuo","zhengque","yiwen","renminbi","zengjia","xiangxia","zhengxiang","jingshi"];
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = Low-50;
		iconData[0]=iconDatas[CurrentBar()%GetArraySize(iconDatas)];
		Commentary("icon="+iconData[0]);
		plt1.icon("icon1",xData,yData,iconData);
		plt2.icon("icon2",xData[0],yData[0],iconData[0]);
	}
```



#### 5、图形隐藏

##### 5.1、K线
-  K线隐藏
```cpp
data0.hideKline();
```
-  隐藏图层上的K线，不影响Plot图形的输出。
-  示例
```cpp
Vars
	Plot  plt;
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
Events
	OnReady()
	{
		Data0.HideKline();
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = AverageFC(Close,5);
		plt.line("MA1",xData,yData);
	}
```

##### 5.2、其他图形
-  图表隐藏
```cpp
plt.hide(name);
```

-  参数
| 参数   | 类型       | 说明     |
| ------ | ---------- | -------- |
| name   | string     | 图表名称，如果是空则Plot所画的图全部隐藏 |

-  示例1-图表隐藏
```cpp
Vars
	Plot  plt1;
	Plot  plt2;
	Plot  plt3;
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
Events
	OnInit()
	{
		plt2.figure();	//独立画板
		plt2.setOption("MA2","x-format","time");
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = AverageFC(Close,5);
		plt1.line("MA1",xData,yData);
		
		yData[0] = AverageFC(Close,5);
		plt2.line("MA2",xData,yData);
		
		yData[0] = AverageFC(Close,10);
		plt2.line("MA3",xData,yData);
		plt2.hide("MA2");
		
		plt3.line("MA4",xData,yData);
		plt3.hide("MA4");
	}
```

-  示例2-画板隐藏
```cpp
Vars
	Plot  plt1;
	Plot  plt2;
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
Events
	OnInit()
	{
		plt2.figure();	//独立画板
		plt2.setOption("MA2","x-format","time");
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = AverageFC(Close,5);
		plt1.line("MA1",xData,yData);
		
		yData[0] = AverageFC(Close,5);
		plt2.line("MA2",xData,yData);
		
		yData[0] = AverageFC(Close,10);
		plt2.line("MA3",xData,yData);
		
		plt2.line("MA4",xData,yData);
		plt2.hide();
	}

```



#### 6、画板布局

##### 6.1、分组
-  定义
~~~cpp
figure(groupid);
~~~
-  参数			

| 参数|类型|说明|
| ------- | ------ | ------|
| groupid |整型 |画板分组ID，0代表K线所在分组|

-  示例
~~~cpp
Vars
	Plot  plt1;
	Plot  plt2;
	Plot  plt3;
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
Events
	OnInit()
	{
		plt1.figure(0);	//独立画板，与k线同一分支
		plt2.figure(0);	//独立画板，与k线同一分支
		plt3.figure();	//独立画板，没有分组
		plt1.setOption("MA1","x-format","time");//设置X为时间轴
		plt2.setOption("MA2","x-format","time");//设置X为时间轴
		plt3.setOption("MA3","x-format","time");//设置X为时间轴
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = AverageFC(Close,5);
		plt1.line("MA1",xData,yData);
		yData[0] = AverageFC(Close,10);
		plt2.line("MA2",xData,yData);
		plt3.line("MA3",date+time,AverageFC(Close,20));
	}
~~~

##### 6.2、布局
-  定义
	-  表格布局
    ~~~cpp
    setLayout(row,column);//k线默认(0,0)
    ~~~
    -  参数			

    | 参数|类型|说明|
    | ------- | ------ | ------|
    | row |Integer |行号，从0开始，k线默认0|
    | column |Integer |列号，从0开始，k线默认0|

	-  单元格合并
    ~~~cpp
    setCrossCells(rows,columns);
    ~~~
    -  参数			

    | 参数|类型|说明|
    | ------- | ------ | ------|
    | rows |Integer |跨行数，默认1|
    | columns |Integer |跨列数，默认1|
    
	-  大小占比
    ~~~cpp
    setSizeWeight(rowWeight,columnWeight);
    ~~~
    -  参数			

    | 参数|类型|说明|
    | ------- | ------ | ------|
    | rowWeight |Integer |行宽占比，默认是1|
    | columnWeight |Integer |列高占比，默认是1|

-  示例
~~~cpp
Vars
	Plot  plt1;
	Plot  plt2;
	Plot  plt3;
	Plot  plt4;
	Plot  plt5;
Events
	OnInit()
	{
		/*目标图形,K线默认(0,0)
          |K线 |MA1|
          |M2 |MA3 |
          | |MA4|MA5 |
       */
		
		plt1.figure();
        plt2.figure();
        plt3.figure();
        plt4.figure();
        plt5.figure();
        plt1.setLayout(0,2);//布局在(0,2)
        plt2.setLayout(1,0);//布局在(1,0)
        plt3.setLayout(1,1);//布局在(1,0)
        plt3.setCrossCells(1,2);//跨2列
        plt4.setLayout(2,1);//布局在(2,1)
        plt5.setLayout(2,2);//布局在(2,2)
        plt1.setOption("MA1","x-format","time");//设置X为时间轴
        plt2.setOption("MA2","x-format","time");//设置X为时间轴
        plt3.setOption("MA3","x-format","time");//设置X为时间轴
        plt4.setOption("MA4","x-format","time");//设置X为时间轴
        plt5.setOption("MA5","x-format","time");//设置X为时间轴
    }
        OnBar(ArrayRef<Integer> indexs)
    {
        plt1.line("MA1",date+time,AverageFC(Close,5));
        plt2.line("MA2",date+time,AverageFC(Close,5));
        plt3.line("MA3",date+time,AverageFC(Close,5));
        plt4.line("MA4",date+time,AverageFC(Close,5));
        plt5.line("MA5",date+time,AverageFC(Close,5));
	}
~~~












​	
