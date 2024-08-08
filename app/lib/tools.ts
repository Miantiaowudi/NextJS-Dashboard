export function debounce(callback: Function, wait: number) {
    // 用来保存定时器任务的标识id
    let timeoutId: any = null;
    // 返回一个事件监听函数(也就是防抖函数)
    return function (event: any) {
        console.log(timeoutId, event);
        // 清除未执行的定时器任务
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        // 启动延迟 await 时间后执行的定时器任务
        timeoutId = setTimeout(() => {
            // 调用 callback 处理事件
            // callback.call(this, event)
            callback(event);
            // 处理完后重置标识
            timeoutId = -1;
        }, wait);
    };
}
