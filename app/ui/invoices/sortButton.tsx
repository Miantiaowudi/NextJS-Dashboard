'use client';

import React, {useEffect, useState} from 'react';
import {Button} from 'antd';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {debounce} from '@/app/lib/tools';

export default function SortButton() {
    const [order, setOrder] = useState<'DESC' | 'ASC'>('ASC');
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const {replace} = useRouter();
    const handleSort = debounce(() => {
        const params = new URLSearchParams(searchParams);
        console.log(params, searchParams, pathname);
        params.set('order', order);
        replace(`${pathname}?${params.toString()}`);
        setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    }, 600);

    return (
        <Button type="primary" onClick={handleSort}>
            {order === 'ASC' ? '点击升序' : '点击降序'}
        </Button>
    );
}
