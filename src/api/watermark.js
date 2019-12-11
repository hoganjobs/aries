/**
 * 水印
 */
'use strict';
var watermark_timer;
let watermark = {}
let w_id = '1.23452384164.123412415'

let setWatermark = (str) => {

    if (document.getElementById(w_id) !== null) {
        document.body.removeChild(document.getElementById(w_id))
    }

    let can = document.createElement('canvas')
    can.width = 240
    can.height = 160

    let cans = can.getContext('2d')
    cans.rotate(-20 * Math.PI / 180)
    cans.font = '20px Vedana'
    // cans.fillStyle = 'rgba(200, 200, 200, 0.20)'
    cans.fillStyle = 'rgba(217, 217, 217, 0.7)'
    cans.textAlign = 'left'
    cans.fontSize = '12px'
    cans.textBaseline = 'Middle'
    cans.fillText(str, can.width / 3, can.height / 2)

    let div = document.createElement('div')
    div.id = w_id
    div.style.pointerEvents = 'none'
    div.style.top = '70px'
    div.style.left = '0px'
    div.style.position = 'fixed'
    div.style.zIndex = '1111'
    div.style.width = document.documentElement.clientWidth - 100 + 'px'
    div.style.height = document.documentElement.clientHeight - 100 + 'px'
    div.style.background = 'url(' + can.toDataURL('image/png') + ') left top repeat'
    document.body.appendChild(div)
    // console.log(document.getElementById('main'))
    // document.getElementById('main').appendChild(div)
    return w_id
}

// 该方法只允许调用一次
watermark.set = (str) => {
    let id = setWatermark(str)
    watermark_timer = setInterval(() => {
        if (document.getElementById(id) === null) {
            id = setWatermark(str)
        }
    }, 500)
    window.onresize = () => {
        setWatermark(str)
    }
}

watermark.clear = () => {
    if(document.getElementById(w_id)) {
        clearInterval(watermark_timer)
        document.getElementById(w_id).remove()
    }

}
export default watermark
