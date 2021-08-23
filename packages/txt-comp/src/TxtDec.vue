<template>
  <div class="dec">
    <div class="detailed-introduce">
      <div
        class="intro-content"
        ref="content"
      >
        <span
          class="merchant-desc"
          v-if="introduce"
          ref="desc"
        >
          {{introduce}}
        </span>
        <div
          class="unfold"
          @click="clickTotal"
          v-if="showExchangeButton"
        >
          {{showTotal ? '收起' : '展开'}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, reactive, toRefs, ref, nextTick } from 'vue'
export default {
  name: 'TxtDec',
  props: {
    text: {
      type: String,
      default: ' '
    },
    line: {
      type: Number,
      default: 3
    }
  },
  setup (props) {
    const state = reactive({
      showTotal: false, // 是否展示所有文本内容
      showExchangeButton: false, // 是否显示展开收起按钮
      showLine: props.line // 显示的文本行数
    })

    const introduce = ref(' ') // 初始化文本
    const desc = ref(null) // 文本组件

    onMounted(() => {
      // 获取初始化数据
      loadInfo()
    })

    /** 文本的操作方法 */
    const txtMethods = {
      /** 将HTML文本转化为文字文本 */
      toText: (HTML) => {
        var input = HTML
        return input.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ')
      },

      /** 截取三行文本 */
      txtDec: () => {
        if (!desc.value) {
          return
        }
        if (introduce.value) { // 对页面中的元素重新赋值，否则会采用之前裁剪过的文本
          desc.value.innerHTML = introduce.value
        } else {
          return
        }

        nextTick(() => {
          let rows = desc.value.getClientRects().length // 文本行数
          let txt = introduce.value // 文本
          // 文本为3行时的字数长度
          let tl = 0 // eslint-disable-line no-unused-vars
          if (rows < state.showLine) { // 未超出行数，返回
            desc.value.innerHTML = introduce.value
            state.seriesInfo.introduction.length - introduce.value.length > 10 ? state.showExchangeButton = true : state.showExchangeButton = false // html元素大于30个字符，显示展开按钮
            return
          }

          // 数据量大时速度太慢，需优化(二分法？)
          while (rows > state.showLine) { // 超出，遍历文字并进行截取，直到文本小于三行
            let step = 1 // 末尾扣除的字数
            if (/<br\/>$/.test(txt)) { // 回退的时候，如果碰到换行要整体替换
              step = 5
            }
            txt = txt.slice(0, -step) // 截取
            desc.value.innerHTML = txt
            rows = desc.value.getClientRects().length
            tl += step
          }
          if (txt.charCodeAt(txt.length - 1) < 255) { // 文字末尾留三个字符的空并加省略号(中文字符和英文字符留空大小不同，中文-3，英文-8)
            desc.value.innerHTML = txt.slice(0, -8) + '...'
          } else {
            desc.value.innerHTML = txt.slice(0, -3) + '...'
          }
          state.showExchangeButton = true // 显示展开收起按钮
          state.exchangeButton = true
        })
      }
    }

    /** 防抖函数 */
    const debounce = (fn, wait) => {
      let timer2 = null
      return function () {
        if (timer2 !== null) {
          clearTimeout(timer2)
        }
        timer2 = setTimeout(fn, wait)
      }
    }

    /** 点击展开/收起按钮 */
    const clickTotal = () => {
      state.showTotal = !state.showTotal
      // 页面数据过多时txtDec的循环块会运行一段时间，造成点击“收起”按钮时卡顿
      // 解决方法：在收起时为父元素增加max-height样式，达到隐藏效果
      // 解决失败：初步判断是vue的虚拟dom算法，不能立即更新元素样式，等到nextTick后才会更新
      !state.showTotal ? desc.value.parentNode.style['max-height'] = `${20 * state.showLine}px` : desc.value.parentNode.style['max-height'] = ''
      state.showTotal ? desc.value.innerHTML = introduce.value : txtMethods.txtDec()
    }

    /** 窗口尺寸改变时重新计算文本的显示长度：使用防抖函数实现 */
    window.addEventListener('resize', debounce(txtMethods.txtDec, 200))

    /** 数据初始化 */
    const loadInfo = () => {
      // 使用封装的api从后台接口获取描述信息（使用自己的接口地址）
      introduce.value = props.text
      txtMethods.txtDec()
    }

    return {
      ...toRefs(state),
      introduce,
      desc,
      clickTotal
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.detailed-introduce {
  width: 800px;
  border: 2px solid grey;
  padding: 10px;
  margin: 0 auto;

  font-size: 14px;
  color: #627081;
  position: relative;
  overflow: hidden;

  .intro-content {
    // 最大高度设为3倍的行间距
    text-indent: 15px;
    overflow: hidden;
    text-align: left;

    .merchant-desc {
      width: 100%;
      line-height: 20px;
    }

    .unfold {
      text-indent: 0;
      z-index: 11;
      height: 20px;
      position: absolute;
      right: 15px;
      bottom: 10px;
      background: #f5f6f7;
      opacity: 1;
      cursor: pointer;
      color: #2878ff;
    }
  }
}
</style>
