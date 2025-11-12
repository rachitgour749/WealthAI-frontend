import React from 'react';

const Gmail = () => {
return (
    <div>
        <button class="w-7 h-7 flex relative overflow-hidden items-center justify-center rounded-full bg-white bg-opacity-0 group transition-all duration-500">
            <svg class="fill-gray-900 relative z-10 transition-all duration-300 group-hover:fill-white"
                xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 54 41" fill="none">
                <path class=""
                    d="M4.00654 40.1236H12.4893V19.5227L0.371094 10.4341V36.4881C0.371094 38.4997 2.00099 40.1236 4.00654 40.1236Z"
                    fill="" />
                <path class=""
                    d="M41.5732 40.1236H50.056C52.0676 40.1236 53.6914 38.4937 53.6914 36.4881V10.4341L41.5732 19.5227"
                    fill="" />
                <path class=""
                    d="M41.5732 3.7693V19.5229L53.6914 10.4343V5.58702C53.6914 1.09118 48.5594 -1.47181 44.9663 1.22448"
                    fill="" />
                <path class=""
                    d="M12.4893 19.5227V3.76904L27.0311 14.6754L41.5729 3.76904V19.5227L27.0311 30.429"
                    fill="" />
                <path class=""
                    d="M0.371094 5.58702V10.4343L12.4893 19.5229V3.7693L9.09617 1.22448C5.49708 -1.47181 0.371094 1.09118 0.371094 5.58702Z"
                    fill="" />
            </svg>
            <div class="absolute top-full left-0 w-full h-full rounded-full bg-red-500 z-0 transition-all duration-500 group-hover:top-0"></div>
        </button>
    </div>
)
}

export default Gmail;