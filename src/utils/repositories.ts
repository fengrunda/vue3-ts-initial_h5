import { defineComponent, ref, computed, reactive, toRefs, onActivated, onMounted, onUnmounted, onDeactivated, watch, Ref, ToRefs, ComputedRef } from 'vue'
import { AxiosResponse } from 'axios'
import { errorFormatter } from '@/utils/util'

interface PaginatedListInput<T = any, D = any> {
  size?: number
  apiFunction: (params?: RequestParams<D>) => Promise<
    AxiosResponse<
      ResponseData<{
        curPage: number
        pageNum: number
        totalNum: number
        details: Array<T>
      }>
    >
  >
  apiParams?: ComputedRef
}
interface ListOutputVariable<T> {
  page?: number
  list: Array<T>
  hasNext?: boolean
  total?: number
  errorHint: string
  errorVisible: boolean
  loading: boolean
  loadingRefresh: boolean
}
/**
 * 分页列表Hook
 * @param obj.apiFunction api函数
 * @param obj.apiParams api参数
 * @param obj.size 分页数
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function paginatedListRepositories<T = any, D = any>(PAYLOAD: PaginatedListInput<T, D>) {
  const state = reactive({
    page: 1,
    list: [],
    hasNext: true,
    total: 0,
    errorHint: '',
    errorVisible: false,
    loading: false,
    loadingRefresh: false
  } as ListOutputVariable<T>)
  async function getList(): Promise<void> {
    state.errorHint = ''
    state.loading = true
    state.errorVisible = false
    try {
      const res = await PAYLOAD.apiFunction({
        params: {
          pageIndex: state.page,
          pageSize: PAYLOAD?.size || 20,
          ...PAYLOAD.apiParams?.value
        },
        config: {
          showToast: false
        }
      })
      const { curPage, pageNum, totalNum, details } = res.data.data || {}
      state.page = curPage + 1
      state.hasNext = curPage < pageNum
      state.total = totalNum
      state.list = state.list.concat(reactive(details))
    } catch (error) {
      state.errorVisible = true
      state.errorHint = errorFormatter(error, PAYLOAD.apiFunction.name)
    }
    state.loading = false
  }
  function init() {
    state.loading = false
    state.page = 1
    state.hasNext = true
    state.total = 0
    state.list = []
    state.errorHint = ''
    state.errorVisible = false
  }
  async function handleRefresh() {
    state.loadingRefresh = true
    init()
    await getList()
    state.loadingRefresh = false
  }
  watch(
    () => PAYLOAD?.apiParams?.value,
    (newValue, oldValue) => {
      /* ... */
      // console.log('watch2 apiParams :>> ', newValue, oldValue)
      if (newValue) {
        init()
        getList()
      }
    },
    { immediate: false }
  )
  // onMounted(getList)
  return {
    ...toRefs(state),
    getList,
    init,
    handleRefresh
  }
}
interface NormalListInput<T, D> {
  size?: number
  apiFunction: (params?: RequestParams<D>) => Promise<AxiosResponse<ResponseData<Array<T>>>>
  apiParams?: ComputedRef
}
/**
 * 普通列表Hook
 * @param obj.apiFunction api函数
 * @param obj.apiParams api参数
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function normalListRepositoriess<T = any, D = any>(PAYLOAD: NormalListInput<T, D>) {
  const state = reactive({
    list: [],
    errorHint: '',
    errorVisible: false,
    loading: false,
    loadingRefresh: false
  } as ListOutputVariable<T>)
  async function getList(): Promise<void> {
    state.errorHint = ''
    state.errorVisible = false
    state.loading = true
    try {
      const res = await PAYLOAD.apiFunction({
        params: {
          ...PAYLOAD?.apiParams?.value
        },
        config: {
          showToast: false
        }
      })
      state.list = reactive(res.data.data)
    } catch (error) {
      state.errorVisible = true
      state.errorHint = errorFormatter(error, PAYLOAD.apiFunction.name)
    }
    state.loading = false
  }
  function init() {
    state.loading = false
    state.list = []
    state.errorHint = ''
    state.errorVisible = false
  }
  async function handleRefresh() {
    state.loadingRefresh = true
    init()
    await getList()
    state.loadingRefresh = false
  }
  watch(
    () => PAYLOAD?.apiParams?.value,
    (newValue, oldValue) => {
      /* ... */
      // console.log('watch2 apiParams :>> ', newValue, oldValue)
      if (newValue) {
        init()
        getList()
      }
    },
    { immediate: false }
  )
  // onMounted(getList)
  // onMounted(getList)
  return {
    ...toRefs(state),
    getList,
    init,
    handleRefresh
  }
}
export interface DetailResponseData<T> extends ResponseData {
  data: T
}
interface DetailInput<T, D> {
  apiFunction: (params?: RequestParams<D>) => Promise<AxiosResponse<ResponseData<T>>>
  apiParams?: ComputedRef
}
/**
 * 列表详情Hook
 * @param obj.apiFunction api函数
 * @param obj.apiParams api参数
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function detailRepositories<T = any, D = any>(PAYLOAD: DetailInput<T, D>) {
  const state = reactive({
    detail: undefined,
    loading: false,
    loadingRefresh: false,
    errorHint: ''
  } as {
    detail: T | undefined
    loading: boolean
    loadingRefresh: boolean
    errorHint: string
  })
  async function getDetail(): Promise<void> {
    state.loading = true
    state.errorHint = ''
    try {
      const res = await PAYLOAD.apiFunction({
        params: {
          ...PAYLOAD?.apiParams?.value
        },
        config: {
          showToast: false
        }
      })
      state.detail = reactive(res.data)?.data
    } catch (error) {
      state.errorHint = errorFormatter(error, PAYLOAD.apiFunction.name)
    }
    state.loading = false
  }
  function init() {
    state.loading = false
    state.detail = undefined
    state.errorHint = ''
  }
  async function handleRefresh() {
    state.loadingRefresh = true
    init()
    await getDetail()
    state.loadingRefresh = false
  }
  watch(
    () => PAYLOAD?.apiParams?.value,
    (newValue, oldValue) => {
      /* ... */
      console.log('detailRepositories apiParams :>> ', newValue, oldValue)
      if (newValue) {
        init()
        getDetail()
      }
    },
    { immediate: false }
  )
  // onMounted(getList)
  // onMounted(getList)
  return {
    ...toRefs(state),
    getDetail,
    init,
    handleRefresh
  }
}
