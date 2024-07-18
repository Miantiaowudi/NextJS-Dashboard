'use server';

import {z} from 'zod';
import {sql} from '@vercel/postgres';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {signIn} from '@/auth';
import {AuthError} from 'next-auth';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.'
    }),
    amount: z.coerce.number().gt(0, {message: 'Please enter an amount greater than $0.'}),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.'
    }),
    date: z.string()
});

const CreateInvoice = FormSchema.omit({id: true, date: true});
const UpdateInvoice = FormSchema.omit({id: true, date: true});

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

/**
 * 创建一个发票
 *
 * @param prevState 之前的状态
 * @param formData 表单数据
 * @returns 如果成功，则返回undefined；如果表单验证失败或数据库错误，则返回包含错误信息的对象
 */
export async function createInvoice(prevState: State, formData: FormData) {
    // Validate form using Zod
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.'
        };
    }

    // Prepare data for insertion into the database
    const {customerId, amount, status} = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // Insert data into the database
    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    } catch (error) {
        // If a database error occurs, return a more specific error.
        return {
            message: 'Database Error: Failed to Create Invoice.'
        };
    }

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

/**
 * 更新发票信息
 *
 * @param id 发票ID
 * @param prevState 之前的发票状态
 * @param formData 包含更新信息的表单数据
 * @returns 如果更新成功，则返回无内容；如果更新失败，则返回错误信息
 */
export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.'
        };
    }

    const {customerId, amount, status} = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
    } catch (error) {
        return {message: 'Database Error: Failed to Update Invoice.'};
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    // throw new Error('Failed to Delete Invoice');
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return {message: 'Deleted Invoice.'};
    } catch (error) {
        return {message: 'Database Error: Failed to Delete Invoice.'};
    }
}

/**
 * 验证用户身份的函数
 *
 * @param prevState 之前的状态，可能是一个字符串或未定义
 * @param formData 表单数据
 * @returns 若验证成功则不返回任何内容，若失败则返回错误消息
 * @throws 抛出非 AuthError 类型的错误
 */
export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}
