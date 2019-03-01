<!--
    可以编辑的文本展示组件
 -->
<template>
  <div class="we-text-input">
    <div v-if="!isEdit">
      <span>{{value}}</span>
      <el-button v-if="!disabled" type="text" icon="el-icon-edit-outline" @click="handleEdit"></el-button>
    </div>
    <el-input 
      v-else 
      ref="input"
      type="text" 
      v-model.trim="editValue" 
      :maxlength="maxlength" 
      @blur="handleBlur" 
      size="small"></el-input>
  </div>
</template>
<script>
export default {
  props: {
    maxlength: {
      type: Number,
      default: 50,
    },
    value: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isEdit: false,
      editValue: '',
    };
  },
  methods: {
    handleEdit() {
      this.editValue = this.value;
      this.isEdit = true;
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    handleBlur() {
      if (this.editValue.replace(/\s+/g, '')) this.$emit('input', this.editValue);
      this.isEdit = false;
    },
  },
};
</script>
<style lang="less" scoped>
@import '../styles/index.less';
.we-text-input{
  display: inline-block;
  min-width: 100px;
  width: 100%;
}
</style>
