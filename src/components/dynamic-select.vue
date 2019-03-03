<template>
  <div class="we-select-scroll">
      <!-- :popper-append-to-body="false" -->
    <el-popover 
      ref="popover" 
      v-model="visible"
      :placement="placement"
      :disabled="disabled"
      @hide="handleHidePoper"
      trigger="focus">
      <el-input
        slot="reference"
        v-model="value" 
        :disabled="disabled"
        @input.native="handleInput"
        @focus="handleFocus"
        :placeholder="backupValue"
        size="small"></el-input>
      <div ref="options" @scroll="handleScroll" class="we-select-scroll-options scrollbar-gray">
        <ul>
          <li 
            v-if="optionList.length"
            v-for="(item, index) in optionList"
            :key="index"
            @mousedown="handleClickOption($event, item)"
            :class="{'selected': item.value === selectedObj.value, 'disabled': optionDisabled(item)}">
            {{item.label}}
          </li>
          <li v-if="isLoading" class="loading">
            <span class="el-icon-loading"></span>
          </li>
          <li v-if="!isLoading && !optionList.length" class="loading">
            <span class="ft-gray4">无数据</span> 
          </li>
        </ul>
      </div>
    </el-popover>
  </div>
</template>
<script>
export default {
  model: {
    prop: 'modelValue',
    event: 'changeId',
  },
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    // 如果传入的数组，没有label、value字段，根据这个map指定label、value的取值
    // { label: 'subjectName', value: 'subjectId' }
    map: {
      type: Object,
      default: () => ({ label: 'label', value: 'value' }),
    },
    // 请求数据的方法，两个参数
    remoteMethod: {
      type: Function,
      required: true,
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    // 某个选项是否禁用
    optionDisabled: {
      type: Function,
      default: () => false,
    },
    // 下拉框出现的位置
    placement: {
      type: String,
      default: 'bottom-start',
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
  },
  data() {
    return {
      isLoading: false,
      // 是否显示popper
      visible: false,
      // 输入框的输入值
      value: '',
      pageNo: 1,
      backupValue: this.placeholder,
      // 拼接选项
      options: [],
      // 选中的数据
      selectedObj: {
        value: '',
        label: '',
      },
      // 上一次请求拿到的数据
      lastData: {},
      debounceTimer: null,
    };
  },
  computed: {
    optionList() {
      return this.options.map((item) => {
        item.label = item[this.map.label];
        item.value = item[this.map.value];
        return item;
      });
    },
  },
  methods: {
    // 滚动到底部加载下一页
    handleScroll(e) {
      if (this.isLoading) return;
      const box = e.target;
      if (box.scrollHeight - box.scrollTop > 280) return;
      if (this.lastData.pageNo === this.lastData.totalPage) return;
      this.pageNo += 1;
      console.log('get next page', box.scrollHeight, box.scrollTop);
      this.getOptions((res) => {
        this.options.push(...res.list);
      });
    },
    // 输入搜索
    handleInput() {
      // let this.debounceTimer = null;
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      this.debounceTimer = setTimeout(() => {
        this.debounceTimer = null;
        if (this.isLoading) return;
        console.log('handle search', this.value);
        this.pageNo = 1;
        this.getOptions((res) => {
          console.log(this.$refs.options);
          this.$refs.options.scrollTop = 0;
          this.options = res.list;
        });
      }, 500);
    },
    // focus事件触发加载第一页
    handleFocus() {
      if (this.value) this.backupValue = this.value;
      this.value = '';
      this.pageNo = 1;
      this.getOptions((res) => {
        this.options = res.list;
      });
    },
    // 点击选项
    handleClickOption(e, item) {
      if (this.optionDisabled(item)) {
        e.preventDefault();
        return;
      }
      this.visible = false;
      this.selectedObj = item;
      this.value = item.label;
      // 更改v-model
      this.$emit('changeId', item.value);
      // 触发change事件
      this.$emit('change', item);
    },
    // 关闭popper时
    handleHidePoper() {
      this.value = this.selectedObj.label;
      if (!this.modelValue) this.backupValue = this.placeholder;
    },
    getOptions(cb) {
      this.isLoading = true;
      this.remoteMethod({
        pageNo: this.pageNo,
        value: this.value,
      }, (res) => {
        this.isLoading = false;
        this.lastData = res;
        cb(res);
      });
    },
  },
  watch: {
    modelValue: {
      handler(val) {
        console.log(val, 'modelValue watch');
        if (!val) {
          this.selectedObj = { label: '', value: '' };
          this.value = '';
        }
      },
      deep: true,
    },
  },
};
</script>
<style lang="less" scoped>
@import '../styles/index.less';

.we-select-scroll{
  display: inline-block;
  vertical-align: middle;
  min-width: 60px;
}
.we-select-scroll-options{
  margin: -6px -12px;
  min-width: 60px;
  height: 280px;
  overflow-y: auto;
  li{
    list-style-type:none;
    font-size: 14px;
    padding: 0 20px;
    height: 34px;
    line-height: 34px;
    white-space: nowrap;
    cursor: pointer;
    &.selected{
      color: @blue;
    }
    &:hover{
      background-color: @light-violet;
    }
    &.loading{
      background-color: @white;
      text-align: center;
      cursor: default;
    }
    &.disabled{
      color: @gray;
      cursor: not-allowed;
    }
  }
}
</style>
