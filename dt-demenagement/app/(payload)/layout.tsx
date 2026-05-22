import type { ReactNode } from 'react'
import type { ServerFunctionClient } from 'payload'
import config from '@payload-config'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import '@payloadcms/next/css'
import '@/custom-admin.css'
import { importMap } from './admin/importMap.js'

type Args = {
  children: ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) =>
  RootLayout({ children, config, importMap, serverFunction })

export default Layout
