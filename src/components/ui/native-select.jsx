import * as React from 'react'

import { cn } from '../../lib/utils'

function NativeSelect({ className, children, ...props }) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        'w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-700 read-only:bg-gray-100 read-only:text-gray-700',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export { NativeSelect }
