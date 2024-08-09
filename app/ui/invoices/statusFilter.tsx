'use client';

import React, {useEffect, useState} from 'react';
import {Select} from 'antd';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';

const StatusFilter = () => {
    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams);
    const [payStatus, setPayStatus] = useState<'paid' | 'pending' | 'all'>((params.get('payStatus') as any) ?? 'all');
    const pathname = usePathname();
    const {replace} = useRouter();

    const onChangeStatus = (status: 'paid' | 'pending' | 'all') => {
        params.set('payStatus', status);
        replace(`${pathname}?${params.toString()}`);
        setPayStatus(status);
    };

    return (
        <Select
            value={payStatus}
            options={[
                {value: 'paid', label: '已支付'},
                {value: 'pending', label: '未支付'},
                {value: 'all', label: '全部'}
            ]}
            onChange={onChangeStatus}
        />
    );
};

export default StatusFilter;
