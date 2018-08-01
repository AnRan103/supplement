### calendar
* props
  * value，String，v-model传入的值，格式：2018-4-18
  * monthRange, Array, 月份可以切换的范围，默认没有限制，例如，[4, 6]表示可以向前切换4个月，向后切换6个月
  * disabledDate, Function, 判断当前日期是否禁用的函数，默认不禁用，true禁用，false不禁用
  * tooltip, Boolean, 是否有鼠标移入效果，默认false
  * data, Object, {num: {}, info: {}}，
    * num,Object，某天的随访计划数量，{'20180507': 4}
    * info,Object，某天的随访计划数据,{'20180507': [{},{}]}

* event
  * change，选中某个日期时触发
  * month-change, 月份切换时触发，参数：[本月第一天，本月最后一天]

* example
  * <we-calendar v-model="follow.date" :month-range="[0,1]" @change="dateChange"></we-calendar>
