import React from "react";

export const Container: React.FC<{children: React.ReactNode}> = ({children}) => {
    return <div className="rounded-lg m-auto border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-md p-6">
        {children}
    </div>
}