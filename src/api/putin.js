import request from '@/utils/request'

export function loadSelectInfo() {
  return request({
    url: '/pc/flow/channel/types/config',
    method: 'get'
  })
}
export function saveGenerate(data) {
  return request({
    url: '/pc/flow/channel/qrCode/save',
    method: 'post',
    data
  })
}
export function loadPageList(query) {
  return request({
    url: '/pc/flow/channel/history',
    method: 'get',
    params: query
  })
}
export function channelAnalysisList(data) {
  return request({
    url: '/pc/flow/channel/analysis',
    method: 'post',
    data
  })
}
export function deleteIt(query) {
  return request({
    url: '/pc/flow/channel/qrCode/delete',
    method: 'get',
    params: query
  })
}
