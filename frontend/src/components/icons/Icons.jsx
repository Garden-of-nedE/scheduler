// lightmode
export function SunIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960" fill="currentColor" {...props}>
            <path d="M565-395q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Zm-226.5 56.5Q280-397 280-480t58.5-141.5Q397-680 480-680t141.5 58.5Q680-563 680-480t-58.5 141.5Q563-280 480-280t-141.5-58.5ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"/>
        </svg>
    )
}

// darkmode
export function MoonIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960" fill="currenColor" {...props}>
            <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"/>
        </svg>
    )
}

export function LogoutIcon({ size = 24, ...props }) {
    return ( 
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960" fill="currentColor" {...props}>
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
        </svg>
    )
}

export function LoginIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960"  fill="currentColor" {...props}>
            <path d="M480-120v-80h280v-560H480v-80h280q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H480Zm-80-160-55-58 102-102H120v-80h327L345-622l55-58 200 200-200 200Z"/>
        </svg>
    )
}

// completed
export function CheckedIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960" fill="currentColor" {...props}>
            <path d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/>
        </svg>
    )
}

// incomplete
export function BoxIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960" fill="currentColor" {...props}>
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z"/>
        </svg>
    )
}

// edit
export function EditIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960" fill="currentColor" {...props}>
            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
        </svg>
    )
}

// down arrow
export function DownIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960" fill="currentColor" {...props}>
            <path d="M480-80 200-360l56-56 184 183v-647h80v647l184-184 56 57L480-80Z"/>
        </svg>
    )
}

// up arrow
export function UpIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960" fill="currentColor" {...props}>
            <path d="M440-80v-647L256-544l-56-56 280-280 280 280-56 57-184-184v647h-80Z"/>
        </svg> 
    )
}

// delete
export function TrashIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960" fill="currentColor" {...props}>
            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
        </svg>
    )
}

// close
export function CrossIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960"fill="currentColor" {...props}>
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
        </svg>
    )
}

export function AddIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960"fill="currentColor" {...props}>
            <path d="M440-120v-320H120v-80h320v-320h80v320h320v80H520v320h-80Z"/>
        </svg>
    )
}

export function SaveIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960"fill="currentColor" {...props}>
            <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM565-275q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/>
        </svg>
    )
}

export function RemoveIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960"fill="currentColor" {...props}>
            <path d="M200-440v-80h560v80H200Z"/>
        </svg>
    )
}

export function NextIcon({ size = 24, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960" fill="currentColor">
            <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
    )
}

export function PrevIcon({ size = 24, ...props}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960"  fill="currentColor">
            <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
            </svg>
    )
}