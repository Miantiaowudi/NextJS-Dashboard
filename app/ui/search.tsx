'use client';

import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {usePathname, useSearchParams, useRouter} from 'next/navigation';
import {useDebouncedCallback} from 'use-debounce';

export default function Search({placeholder}: {placeholder: string}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const {replace} = useRouter();

    function debounce(callback: Function, wait: number) {
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

    const handleSearch = debounce((term: string) => {
        console.log(term);
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        // console.log(searchParams, params)
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 600);

    return (
        <div className="relative flex flex-1 flex-shrink-0">
            <label htmlFor="search" className="sr-only">
                Search
            </label>
            <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                placeholder={placeholder}
                onChange={e => handleSearch(e.target.value)}
                defaultValue={searchParams.get('query')?.toString()}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
        </div>
    );
}
