
<!-- 树形组件 -->
<template>
  <div class="comTreeBox">
    <ul class="comTreeUl" v-for="(ul, ulIndex) in list" :key="'ul_' + ulIndex">
      <li>
        <el-checkbox class="comTreeCheckbox" v-model="ulValue[ulIndex]" @change="checkAll(ulIndex)">
          <span class="text text_1">{{ul.label}}</span>
        </el-checkbox>
      </li>
      <li class="comTreeLi">
        <el-checkbox class="comTreeCheckbox" v-for="(li, liIndex) in ul.children" :key="'li_' + liIndex" v-model="li.status"
          @change="check(ulIndex, li.is_default_select, $event)"
        >
          <span class="text text_2">{{li.label}}</span>
        </el-checkbox>
      </li>
    </ul>
    <el-tag type="danger" size="mini" @click="cancel">全不选</el-tag>
  </div>
</template>

<script>
export default {
  props: ['list', 'selectIndex'],
  data() {
    return {
      ulValue: {}
    }
  },
  methods: {
    /**
     * [全选 / 全不选：单组]
     * @param {[Int]} ulIndex 组索引
     */
    checkAll(ulIndex) {
      const { list = [], ulValue = {} } = this
      const data = list[ulIndex] || {}
      const { children = [] } = data
      /* ----- 统一勾选子指标 ----- */
      const status = ulValue[ulIndex]
      children.map((item = {}) => {
        item.status = status
      })
      /* ----- 勾选默认指标 ----- */
      this.checkDefault()
    },
    /**
     * [全不选]
     */
    cancel() {
      const { list = [] } = this
      list.forEach((item) => {
        const { children = [] } = item
        children.forEach((val) => {
          val.status = false
        })
      })
      /* ----- 勾选默认指标 ----- */
      this.checkDefault(false)
    },
    /**
     * [单选]
     * @param {[Int]}     ulIndex           组索引
     * @param {[Int]}     is_default_select 默认指标：0、1
     * @param {[Boolean]} status            当前选中状态：true、false
     */
    check(ulIndex, is_default_select, status) {
      const { list = [] } = this
      const data = list[ulIndex] || {}
      const { children = [] } = data
      /* ----- 计算：是否已经全选 ----- */
      const length = children.length
      let num = 0
      children.forEach((item = {}) => {
        if (item.status) {
          num++
        }
      })
      if (num === length) {
        this.ulValue[ulIndex] = true
      } else {
        this.ulValue[ulIndex] = false
      }
      /* ----- 勾选默认指标 ----- */
      if (!status) { /* 取消选中 */
        this.checkDefault(false)
      } else {
        this.checkDefault()
      }
    },
    /**
     * [勾选默认指标 && 将选中项传递给父级]
     * @param {[Boolean]} toCheck 是否勾选默认指标
     */
    checkDefault(toCheck = true) {
      const { list = [], selectIndex } = this
      const obj = {}
      list.map((group = {}) => {
        const { children = [] } = group
        children.forEach((item = {}) => {
          const { is_default_select, index_2, index_3 } = item
          /* 提取 && 勾选：默认的指标 */
          if (toCheck && is_default_select) {
            item.status = true
            obj[`${index_2}-${index_3}`] = item
          }
          /* 提取：勾选的指标 */
          if (item.status) {
            obj[`${index_2}-${index_3}`] = item
          }
        })
      })
      this.$emit('comTreeSubmit', { index: selectIndex, data: obj })
    }
    //
  }
}
</script>

<style scoped>
.comTreeBox {
  display: flex;
}

.comTreeUl {
  padding: 0 10px 0 0;
}
.comTreeBox > .comTreeUl:last-child {
  padding-right: 0;
}
.comTreeLi {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
}
.text {
  font-size: 12px;
}
.text_1 {
  color: #303133;
}
.text_2 {
  color: #606266;
}
</style>
<style>
.comTreeCheckbox > .el-checkbox__label {
  padding-left: 4px !important;
}
</style>
