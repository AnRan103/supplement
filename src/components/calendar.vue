<template>
	<div class="we-calendar">
		<div class="calendar-header">
      <el-button type="text" class="calendar-btn" @click="getMonth(-1)" :disabled="canGoNext(-1)">
        <span class="el-icon-arrow-left"></span>
      </el-button>
			<span class="calendar-month">{{year}}年{{month+1}}月</span>
      <el-button type="text" class="calendar-btn" @click="getMonth(1)" :disabled="canGoNext(1)">
        <span class="el-icon-arrow-right"></span>
      </el-button>
		</div>
		<div class="calendar-body">
			<table>
				<thead>
					<tr>
						<th>周日</th>
						<th>周一</th>
						<th>周二</th>
						<th>周三</th>
						<th>周四</th>
						<th>周五</th>
						<th>周六</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(column,index) in columns" :key="index">
						<td
              v-for="(day,index) in column"
              :key="index"
              :class="dateCls(day)"
              @click="pickDate(day)">
              <el-tooltip
              v-if="tooltip && getInfo(day.value)"
              :open-delay="500"
              popper-class="we-calendar-popper"
              :visible-arrow="false"
              placement="bottom-start"
              effect="light">
                <div>
                  <span>{{day.date}}</span>
                  <span class="calender-tag" v-if="!day.notCurrent && getNum(day.value)">{{getNum(day.value)}}</span>
                </div>
                <div slot="content">
                  <div class="calendar-tooltip" v-for="(info,index) in getInfo(day.value)" :key="index">
                    <el-tag
                      class="calendar-tag"
                      size="small"
                      :type="['','success','info','info'][info.followupStatus]">{{['待执行','已完成','已过期','已关闭'][info.followupStatus]}}</el-tag>
                    <div style="font-size: 14px; margin-bottom: 10px;">{{info.followupSubject}}</div>
                    <div class="we-text-info" style="font-size: 12px;">随访时间：&nbsp;{{info.followupTime}}</div>
                  </div>
                </div>
              </el-tooltip>
              <div v-else>
                <span>{{day.date}}</span>
                <span class="calender-tag" v-if="!day.notCurrent && getNum(day.value)">{{getNum(day.value)}}</span>
              </div>
            </td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
<script>
  export default {
    props: {
      value: {
        type: String,
      },
      monthRange: {
        type: Array,
        default: () => [Infinity, Infinity],
      },
      disabledDate: {
        type: Function,
        default: () => false,
      },
      tooltip: {
        type: Boolean,
        default: false,
      },
      data: {
        type: Object,
        default: () => {},
      },
      // getData: {
      //   type: Function,
      //   required: false,
      // },
    },
    data() {
      return {
        // 当前面板上的年月
        year: null,
        month: null,
        // 今天
        current: {},
        // 选中的
        select: {
          year: null,
          month: null,
          date: null,
        },
        columns: [],
        // visitNum: {},
        // visitInfo: {},
        isLoading: false,
      };
    },
    created() {
      const current = new Date();
      const year = current.getFullYear();
      const month = current.getMonth();
      const date = current.getDate();
      this.current = {
        year,
        month,
        date,
      };
      if (this.value) {
        console.log(this.value, 'value');
        const select = this.value.split('-');
        this.year = parseInt(select[0], 10);
        this.month = parseInt(select[1], 10) - 1;
        this.select = {
          year: this.year,
          month: this.month,
          date: parseInt(select[2], 10),
          value: this.value,
        };
      } else {
        this.year = year;
        this.month = month;
        // this.pickDate({
        //   year,
        //   month,
        //   date,
        //   value: this.getFormatter(this.current),
        // });
      }
      this.getColumns();
      this.getVisitData();
    },
    methods: {
      // 是否可以切换到上（下）个月
      canGoNext(index) {
        let range = (this.year - this.current.year) * 12;
        range += this.month - this.current.month;
        if (index === 1) return range >= this.monthRange[1];
        return (0 - range) >= this.monthRange[0];
      },
      // 触发month-change，获取每月的随访计划数量
      getVisitData() {
        const data = {
          year: this.year,
          month: this.month,
        };
        const currentMonth = [
          `${this.getFormatter({ ...data, date: 1 })}`,
          `${this.getFormatter({ ...data, date: new Date(this.year, this.month + 1, 0).getDate() })}`,
        ];
        this.$emit('month-change', currentMonth);
      },
      // 计算当前月应该显示的内容
      getColumns() {
        // 本月第一天
        const currentMonthFirstDay = new Date(this.year, this.month, 1);
        // 本月最后一天
        const currentMonthLastDay = new Date(this.year, this.month + 1, 0);
        // 本月第一天是星期几
        const firstDayWeek = currentMonthFirstDay.getDay();
        // const lastDayWeek = currentMonthLastDay.getDay();
        // 上个月最后一天
        const prevMonthLastDay = new Date(this.year, this.month, 0).getDate();
        // 本月最后一天
        const currentMonthLastDate = currentMonthLastDay.getDate();

        let start = 0 - firstDayWeek;
        if (start === 0) start = -7;
        const end = start + 42;
        // if (end === 0) end = 7;
        // end += currentMonthLastDate;

        const arr = [[]];
        let flagSeven = 0;

        for (start; start < end; start += 1) {
          let thisDate;
          let thisMonth;
          let notCurrent = true;
          if (start < 0) {
            thisMonth = this.month - 1;
            thisDate = prevMonthLastDay + start;
          } else if (start >= currentMonthLastDate) {
            // debugger
            thisMonth = this.month + 1;
            thisDate = start - currentMonthLastDate;
          } else {
            thisMonth = this.month;
            thisDate = start;
            notCurrent = false;
          }
          if (arr[flagSeven].length === 7) {
            flagSeven += 1;
            arr[flagSeven] = [];
          }
          const dateObj = {
            notCurrent,
            date: thisDate + 1,
            month: thisMonth,
            year: this.year,
          };
          dateObj.value = this.getFormatter(dateObj);
          arr[flagSeven].push(dateObj);
        }
        this.columns = arr;
      },
      // 获取格式化的日期
      getFormatter(data) {
        const valueDate = data.date < 10 ? `0${data.date}` : data.date;
        const valueMonth = data.month < 9 ? `0${data.month + 1}` : data.month + 1;
        return `${data.year}-${valueMonth}-${valueDate}`;
      },
      // 月份变化时
      getMonth(num) {
        let newMonth = this.month + num;
        if (newMonth > 11) {
          newMonth = 0;
          this.year += 1;
        }
        if (newMonth < 0) {
          newMonth = 11;
          this.year -= 1;
        }
        this.month = newMonth;
        this.getVisitData();
        this.getColumns();
      },
      // 选择日期
      pickDate(day) {
        if (!day.notCurrent) {
          if (this.disabledDate(day)) return;
          this.select = {
            year: day.year,
            month: day.month,
            date: day.date,
            value: day.value,
          };
          this.$emit('input', day.value);
          this.$emit('change', this.select);
        } else {
          let count = day.month - this.month;
          if (count === 11) count = -1;
          if (count === -11) count = 1;
          if (!this.canGoNext(count)) this.getMonth(count);
        }
      },
      // 日期的css类
      dateCls(day) {
        return {
          'calendar-notCurrent': day.notCurrent,
          'calendar-currentDay': day.date === this.current.date && day.month === this.current.month && day.year === this.current.year,
          'calendar-selectDay': !day.notCurrent && day.date === this.select.date && day.month === this.select.month && day.year === this.select.year,
          'calendar-disabledDay': !day.notCurrent && this.disabledDate(day),
        };
      },
      // 随访数量
      getNum(day) {
        if (this.data && this.data.num) return this.data.num[day.split('-').join('')];
        return false;
      },
      // 随访详情
      getInfo(day) {
        if (this.data && this.data.info) return this.data.info[day.split('-').join('')];
        return false;
      },
    },
    watch: {
      // 保持v-model同步
      value(val) {
        if (val === this.select.value) return false;
        if (val) {
          const select = val.split('-');
          this.year = parseInt(select[0], 10);
          this.month = parseInt(select[1], 10) - 1;
          this.getVisitData();
          this.getColumns();
          this.select = {
            year: this.year,
            month: this.month,
            date: parseInt(select[2], 10),
            value: val,
          };
        } else {
          this.select = {
            year: '',
            month: '',
            date: '',
            value: '',
          };
        }
        return true;
      },
    },
  };
</script>
<style lang="less" scoped>
@import '../styles/index.less';
.we-calendar{
  width: 100%;
  min-width: 700px;
  .calendar-header{
    padding:0 20px;
    border: 1px solid #eee;
    border-bottom: none;
    height: 44px;
    line-height: 43px;
    text-align: center;
    background: #f7f7f7;
    font-size: 16px;
    color: #333;
    letter-spacing: 1px;
    .calendar-btn{
      color: #999;
      &:hover{
        color: #5E7BE4;
      }
    }
  }
  .calendar-body{
    table{
      width:100%;
      border-collapse: collapse;
      border: 1px solid #eee;
      th,td{
        text-align: center;
        border: 1px solid #eee;
      }
      th{
        height: 34px;
        line-height: 33px;
        background: #f7f7f7;
        font-size: 12px;
        font-weight: normal;
        color: #666;
      }
      tbody{
        background: #fff;
      }
      td{
        position: relative;
        padding: 0 20px;
        height: 40px;
        line-height: 39px;
        font-size: 14px;
        text-align: left;
        color: #333;
        &:not(.calendar-notCurrent){
          cursor: pointer;
        }
        &:not(.calendar-notCurrent):not(.calendar-selectDay):not(.calendar-disabledDay):hover, &.calendar-currentDay{
          background-color: #eef2ff;
        }
        &.calendar-notCurrent{
          color: #bbb;
        }
        &.calendar-selectDay{
          background: #5e7be4;
          color: #fff;
        }
        &.calendar-disabledDay{
          cursor: not-allowed;
        }
        .calender-tag{
          position: absolute;
          top: 7px;
          right: 10px;
          display: block;
          min-width: 30px;
          max-width: 88px;
          height: 26px;
          line-height: 24px;
          padding: 0 4px;
          border: 1px solid #5e7be4;
          border-radius: 12px;
          background: #eef2ff;
          color: #5e7be4;
          font-size: 12px;
          text-align: center;
          text-overflow: ellipsis;
          overflow: hidden;
        }

      }
    }
  }
}
.we-calendar-popper.el-tooltip__popper.is-light{
  padding: 0;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.40);
  border-width: 0;
  max-height: 204px;
  overflow-y: auto;
  .calendar-tooltip{
    position: relative;
    width: 320px;
    height: 68px;
    padding: 15px 20px;
    &:nth-child(2n){
      background: #EEF2FF;
    }
    .calendar-tag{
      position: absolute;
      top: 0;
      right: 0;
    }
  }
  &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
  }
  &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
      background: rgba(0,0,0,0.2);
  }
  &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
      border-radius: 0;
      background: rgba(0,0,0,0.1);
  }
}
</style>

