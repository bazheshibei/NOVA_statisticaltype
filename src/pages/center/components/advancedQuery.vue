
<!-- 高级查询 -->

<template>
  <el-dialog class="comDialog" title="高级查询" :visible.sync="isDialog" width="60%" :before-close="handleClose">
    <!-- 内容 -->
    <el-button size="mini" type="primary" plain @click="addData">增加条件</el-button>
    <br>
    <br>
    <div class="comContentBox" :style="styleObj">
      <div class="lineBox" v-for="(item, index) in submitVal" :key="'line_' + index">
        <!-- 大类 -->
        <el-select class="com_1" size="mini" v-model="submitVal[index].typecode" @change="selectChange(index)">
          <el-option v-for="item in selectObj" :key="'cate_' + item.id" :label="item.name" :value="item.word"></el-option>
        </el-select>
        <!-- 指标 -->
        <el-select class="com_2" filterable size="mini" v-model="submitVal[index].indicatorcode" @change="_proving">
          <el-option v-for="item in selectObj2[submitVal[index].typecode]" :key="'cate_2_' + item.id" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <!-- 限制 -->
        <el-select class="com_3" size="mini" v-model="submitVal[index].searchtype" @change="_proving">
          <el-option v-for="item in typeArr" :key="'type_' + item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <!-- 值：文本框 '1' -->
        <el-input class="com_4" v-if="selectVal[submitVal[index].typecode + '^' + submitVal[index].indicatorcode] && selectVal[submitVal[index].typecode + '^' + submitVal[index].indicatorcode].type === '1'"
          size="mini" v-model="submitVal[index].searchvalue" :disabled="submitVal[index].searchtype === 'n' || submitVal[index].searchtype === 'nn'" @change="_proving"
        ></el-input>
        <!-- 值：下拉框 '2' -->
        <el-select class="com_4" v-if="selectVal[submitVal[index].typecode + '^' + submitVal[index].indicatorcode] && selectVal[submitVal[index].typecode + '^' + submitVal[index].indicatorcode].type === '2'"
          size="mini" v-model="submitVal[index].searchvalue" @change="_proving"
        >
          <el-option v-for="item in selectVal[submitVal[index].typecode + '^' + submitVal[index].indicatorcode].arr" :key="submitVal[index].typecode + '^' + submitVal[index].indicatorcode + '^' + item"
            :label="item" :value="item"
          ></el-option>
        </el-select>
        <!-- 删除 -->
        <el-button class="com_5" size="mini" icon="el-icon-delete-solid" @click="deleteData(index)"></el-button>
      </div>
    </div>
    <!-- /内容 -->
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" @click="reset">
        重置查询条件 <i class="el-icon-refresh"></i>
      </el-button>
      <el-button size="mini" type="primary" @click="search">
        查找 <i class="el-icon-search"></i>
      </el-button>
    </span>

  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      typeArr: [
        { label: '包含', value: 'like' },
        { label: '不包含', value: 'nlike' },
        { label: '等于', value: 'eq' },
        { label: '不等于', value: 'ne' },
        { label: '大于', value: 'gt' },
        { label: '小于', value: 'lt' },
        { label: '大于等于', value: 'ge' },
        { label: '小于等于', value: 'le' },
        { label: '空值', value: 'n' },
        { label: '非空值', value: 'nn' }
      ],
      submitVal: [{ typecode: '', indicatorcode: '', searchtype: 'like', searchvalue: '' }], // 提交时的值
      styleObj: {} // 内容容器样式
    }
  },
  created() {
    const height = document.documentElement.clientHeight - 430
    this.styleObj = { maxHeight: height + 'px', overflowY: 'auto' }
  },
  computed: {
    ...mapState(['isDialog']),
    ...mapState({
      /**
       * [对象：大类]
       */
      selectObj(state) {
        const { selectArr } = state
        const obj = {}
        selectArr.forEach(function (item) {
          /* 处理一级选项 */
          obj[item.word] = item
        })
        // console.log(2222, obj)
        return obj
      }
    }),
    /**
     * [对象：节点]
     */
    selectObj2() {
      const { selectObj, submitVal } = this
      const obj = {}
      submitVal.forEach(function (item) {
        const { typecode = '' } = item
        if (typecode !== '') {
          obj[typecode] = selectObj[typecode].options[1].options
        }
      })
      return obj
    },
    /**
     * [对象：值]
     */
    selectVal() {
      const { selectObj, submitVal } = this
      const obj = {}
      submitVal.forEach(function (item) {
        const { typecode = '', indicatorcode = '' } = item
        if (typecode !== '' && indicatorcode !== '') {
          let search_type = '1'
          let enum_value = ''
          for (let i = 0; i < selectObj[typecode].options[1].options.length; i++) {
            const option = selectObj[typecode].options[1].options[i]
            if (option.value === indicatorcode) {
              search_type = option.search_type
              enum_value = option.enum_value
              break
            }
          }
          let arr = []
          let type = '1'
          type = search_type === null ? '1' : search_type
          if (search_type === '2') {
            arr = enum_value === null ? [] : enum_value.split(',')
          }
          obj[`${typecode}^${indicatorcode}`] = { type, arr }
        }
      })
      return obj
    }
  },
  methods: {
    /**
     * [切换大类时，重置指标]
     * @param {[Int]} index 数据索引
     */
    selectChange(index) {
      this.submitVal[index].indicatorcode = ''
      /** 验证：提取可用数据 **/
      this._proving()
    },
    /**
     * [验证：提取可用数据]
     */
    _proving() {
      const { submitVal } = this
      const arr = []
      submitVal.forEach(function (item) {
        const { typecode, indicatorcode, searchtype } = item
        let { searchvalue } = item
        if (typecode && indicatorcode && searchtype) {
          if (searchtype === 'n' || searchtype === 'nn') {
            item.searchvalue = ''
            searchvalue = ''
            arr.push({ typecode, indicatorcode, searchtype, searchvalue })
          } else if (searchvalue) {
            arr.push({ typecode, indicatorcode, searchtype, searchvalue })
          }
        }
      })
      /* 保存有用数据 */
      this.$store.commit('saveData', { name: 'advancedQuery', obj: arr })
    },
    /**
     * [增加条件]
     */
    addData() {
      const data = { typecode: '', indicatorcode: '', searchtype: 'like', searchvalue: '' }
      this.submitVal.push(data)
    },
    /**
     * [删除数据]
     * @param {[Int]} index 索引
     */
    deleteData(index) {
      this.submitVal.splice(index, 1)
      /** 验证：提取可用数据 **/
      this._proving()
    },
    /**
     * [重置]
     */
    reset() {
      this.submitVal = [{ typecode: '', indicatorcode: '', searchtype: 'like', searchvalue: '' }]
      this.$store.commit('saveData', { name: 'advancedQuery', obj: [] })
    },
    /**
     * [搜索]
     */
    search() {
      /** 验证：提取可用数据 **/
      this._proving()
      /** 查询 **/
      this.$store.dispatch('search', { operationType: 'search', isLoading: true })
      this.$store.commit('saveData', { name: 'isDialog', obj: false })
    },
    /**
     * [隐藏：高级查询]
     */
    handleClose() {
      this.$store.commit('saveData', { name: 'isDialog', obj: false })
    }
  }
}
</script>

<style scoped>
.comContentBox {
  flex: 1;
}
.lineBox {
  width: 100%;
  margin-bottom: 10px;
  display: flex;
}
.lineBox:last-child {
  margin-bottom: 0;
}

/*** 下拉框 ***/
.com_1, .com_2, .com_3, .com_4 {
  margin-right: 10px;
}
.com_1 {
  width: 150px;
}
.com_2 {
  width: 200px;
}
.com_3 {
  width: 110px;
}
.com_4 {
  flex: 1;
}
</style>

<style>
.comDialog > .el-dialog > .el-dialog__body {
  padding: 10px 20px !important;
}
</style>
