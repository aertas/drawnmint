import {useEffect} from "react";
import conf from "/next.config.js"

export default function Countdown({status}) {
    useEffect(() => {

        //const future = Date.parse("June 29, 2022 22:22:00");
        const future = Date.parse(conf.mintDate);
        //const future = Date.UTC(2022, 5, 29,20,23);

        const timer = document.getElementById("timer");

        const options = {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        };
        const local = (new Date(future)).toLocaleString("en", options);
        const counterDate = document.getElementById("counterDate");

        const updateTimer = function () {
            const now = new Date(),
                diff = future - now,
                days = Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours = Math.floor(diff / (1000 * 60 * 60)),
                mins = Math.floor(diff / (1000 * 60)),
                secs = Math.floor(diff / 1000),
                hh = hours - days * 24,
                mm = mins - hours * 60,
                ss = secs - mins * 60;
            timer.innerHTML = '';
            if (days > 0) {
                timer.innerHTML += '<div>' + days + '<span>days</span></div>';
            }
            timer.innerHTML += '<div>' + hh + '<span>hours</span></div>';
            timer.innerHTML +=
                '<div>' + mm + '<span>mins</span></div>' +
                '<div>' + ss + '<span>secs</span></div>';
            counterDate.innerHTML = local;
        }
        setInterval(updateTimer, 1000);
        updateTimer();
    }, [])

    return (
        <div className="counterCount">
            <h3 className="counterHead">DROP TIME</h3>
            <div id="timer"/>
            <div className="counterDate" id="counterDate"/>
        </div>
    )
}
