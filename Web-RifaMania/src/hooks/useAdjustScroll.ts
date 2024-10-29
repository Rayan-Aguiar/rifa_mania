import { useEffect } from "react";

export function useAdjustScroll(isFooterVisible: boolean) {
    useEffect(() =>{
        if(isFooterVisible) {
            document.body.style.paddingBottom = '88px'
        } else {
            document.body.style.paddingBottom = '0px'
        }
        return () =>{
            document.body.style.paddingBottom = '0px'
        }
    }, [isFooterVisible])
}