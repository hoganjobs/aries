[TOC]

# Plot帮助文档

## 1 Plot定义

###1.1 背景
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
###1.2 定义
- Plot表示画图对象
- 可以重复使用画图、设置坐标、属性等
- 可以定义画板内的叠加关系
- 可以定义画布内的布局关系
- 公式定义

~~~cpp
Vars
  Plot  plt;	
~~~

## 2 画板定义

### 2.1 定义
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

### 2.2 主图

-  Plot本身不代表是否为主图或附图
-  Plot可以重复使用
-  主图：画板第一个输出的图形，且决定X、Y轴，即为主图

### 2.3 附图
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

###2.4 示例
~~~cpp
Vars
	Plot  parentPlt1;//主图
	Plot  parentPlt2;//主图
	Plot  childPlt;//附图
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
Events
	OnInit()
	{
		parentPlt1.figure();	//独立画板
		parentPlt2.figure();	//独立画板
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

### 2.5 K线

####2.5.1 叠加
-  K线默认为主图，  不需要显示设置Figure()
-  附图如果没有显示调用subplot，则默认叠加到k线所在主图

####2.5.2 示例
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

## 3 属性设置
### 3.1 属性函数
~~~cpp
plt.setOption(name,option,value);
~~~

-  参数

| 参数   | 类型   | 说明                                             |
| ------ | ------ | -----------------------------------------------|
| name   | String | 图形名称，建议只要只用字符、数字、下划线组成 |
| option | String | 属性名称                               |
| value  | String/Numeric/Integer | 属性值，根据不同的属性对应相应的值类型 |

### 3.2 设置颜色

####3.2.1 定义
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

####3.2.2 示例
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

### 3.3 设置宽度

####3.3.1 定义
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

####3.3.2 示例
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

### 3.4 设置风格

####3.4.1  定义
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

####3.4.2  示例
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
### 3.5 设置线型

####3.5.1  定义
-  属性名： "line-type"
-  属性表
| 属性值     | 类型 | 说明   | 应用场景 |
| --------- | ---- | ------ | ------------ |
| Enum_Dot   | 枚举 | 点     | 画线           |
| Enum_Line  | 枚举 | 线     | 画线           |
| Enum_Cross | 枚举 | 十字线 | 画线           |

####3.5.2  示例
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

### 3.6 设置布局

#### 3.6.1 设置上边界
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

#### 3.6.2 设置下边界

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

#### 3.6.3 示例
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

### 3.6 设置坐标轴格式

####3.7.1 定义
-  X轴属性名： "x-format"
-  Y轴属性名： "y-format"
-  属性表
| 属性值 | 类型 | 说明| 应用场景|
| ------ | ---- | -----------| ----------|
| numberic | String | 指定主图x轴数值，也是默认值 | 所有图形|
| numberic_s | String | 指定主图x轴数值，数值是会缩进的(万/亿等) | 所有图形|
| time   | String | 指定主图x轴为时间轴| 所有图形 |

-  说明：k线所在图形，默认是是时间轴，不能修改

####3.7.2 示例
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

### 3.8 设置忽略最大起始bar

####3.8.1 定义
-  属性名： "ignoremaxback"
-  属性表
| 属性值 | 类型 | 说明 | 应用场景 |
| ------ | ---- | -----------| ------------ |
| true   | bool | 忽略最大起始bar   | 所有图形 |
| false  | bool | 取消忽略最大起始bar | 所有图形|
-  说明：设置忽略最大起始bar后，在最大回溯以内仍然显示。

####3.8.2 示例
```cpp
Vars
	Plot  plt;
    Array<Numeric> xData;//x轴数据集
    Array<Numeric> yData;//y轴数据集
Events
	OnInit()
	{
		plt.setOption("MA2","ignoremaxback",true);
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		xData[0] = date+time;
		yData[0] = AverageFC(Close,5);
		plt.line("MA1",xData,yData);
		
		plt.line("MA2",date+time,AverageFC(Close,10));
	}
```

### 3.9 设置柱状图属性

####3.9.1 填充属性
-  属性名： "fill"
-  属性表
| 属性值 | 类型 | 说明         | 应用场景 |
| ------ | ---- | ------------ | -------------- |
| true   | bool | 柱状图填充   | 柱状图         |
| false  | bool | 柱状图不填充 | 柱状图         |

####3.9.2 描述信息
-  属性名： "bar-descript"
-  属性值：类型为字符串数组，对应每一个柱状图。

####3.9.3 示例
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

### 3.10 设置表格属性

#### 3.10.1 列表头
-  属性名： "x-title"
-  属性值：类型为字符串数组，对应表格的列表头名称

#### 3.10.2 表格属性

| 属性名     | 类型    | 说明 |
| ------------ | ------- | -----------|
| key-column  | String | 设置某列名称为行头|
| title-color | Integer | 设置表头颜色 |

####3.10.3 示例
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
		//titleX = ["开盘","高价","低价","最新","成交量","持仓量","时间"];
		plt.figure();		
		//plt.setOption("table","x-title",titleX);//如果设置即定了顺序，否则根据动态更新创建顺序
		plt.setOption("table","title-color",Yellow);
		plt.setOption("table","key-column","时间");//设置时间所在列为行头，否则自动添加序号	
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		plt.table("table","开盘",Text(Open),DateTimeToString(Date+Time));
		plt.table("table","最新",Text(Close),DateTimeToString(Date+Time));
		plt.table("table","高价",Text(High),DateTimeToString(Date+Time));
		plt.table("table","低价",Text(Low),DateTimeToString(Date+Time));
		plt.table("table","成交量",Text(Vol),DateTimeToString(Date+Time));
		plt.table("table","高价",Text(OpenInt),DateTimeToString(Date+Time));
		plt.table("table","持仓量",Text(Vol),DateTimeToString(Date+Time));
		
	}
```

##4 图形输出

### 4.1 线形

### 4.1.1 线形输出
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

### 4.1.2 单次输出

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

### 4.1.3 批量输出
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

### 4.2 柱状图

#### 4.2.1 柱状图输出
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

#### 4.2.2 横向柱状图输出(待开发)
```cpp
pl.barh(name,x-axis,y-axis);
```
-  参数
| 参数   | 类型           | 说明         |
| ------ | -------------- | ------------ |
| name   | String        | 柱状图名称 |
| X-axis | Array\<Numeric\>或Numeric | X轴坐标数组  |
| Y-axis | Array\<Numeric\>或Numeric | y轴坐标数组  |

#### 4.2.3 单次输出
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

#### 4.2.4 批量输出
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

### 4.3 文本
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

### 4.4 表格
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

-  [3.10.3 示例](#3.10.3 示例)

### 4.5 K线
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

### 4.6 图标
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

## 5 图形隐藏

### 5.1 K线
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

### 5.2 其他图形
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

## 6 画板布局

### 6.1 分组
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

### 6.2 布局
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
	Plot  plt6;
Events
	OnInit()
	{
		/*目标图形,K线默认(0,0)
			|K线|MA1|MA2|
			|M3 |MA4    |
			|   |MA5|MA6|
		*/
		
		plt1.figure();
		plt2.figure();
		plt3.figure();
		plt4.figure();
		plt5.figure();
		plt6.figure();
		plt1.setLayout(0,1);//布局在(0,1)
		plt2.setLayout(0,2);//布局在(0,2)
		
		plt3.setLayout(1,0);//布局在(1,0)
		plt3.setCrossCells(2,1);//跨2行
		
		plt4.setLayout(1,1);//布局在(1,1)
		plt4.setCrossCells(1,2);//跨2列
		
		plt5.setLayout(2,1);//布局在(2,1)
		plt6.setLayout(2,2);//布局在(2,2)
		
		plt1.setOption("MA1","x-format","time");//设置X为时间轴
		plt2.setOption("MA2","x-format","time");//设置X为时间轴
		plt3.setOption("MA3","x-format","time");//设置X为时间轴
		plt4.setOption("MA4","x-format","time");//设置X为时间轴
		plt5.setOption("MA5","x-format","time");//设置X为时间轴
		plt6.setOption("MA6","x-format","time");//设置X为时间轴
	}
	OnBar(ArrayRef<Integer> indexs)
	{
		plt1.line("MA1",date+time,AverageFC(Close,5));
		plt2.line("MA2",date+time,AverageFC(Close,5));
		plt3.line("MA3",date+time,AverageFC(Close,5));
		plt4.line("MA4",date+time,AverageFC(Close,5));
		plt5.line("MA5",date+time,AverageFC(Close,5));
		plt6.line("MA6",date+time,AverageFC(Close,5));
	}
~~~
