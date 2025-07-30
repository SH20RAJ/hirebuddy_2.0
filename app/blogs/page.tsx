'use client'
import Blogs from '@/pages/Blogs'
import React from 'react'

function page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
    return <Blogs  />
}

export default page