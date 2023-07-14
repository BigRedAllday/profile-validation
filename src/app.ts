import * as fs from "fs";
import {addSeconds} from "date-fns";

async function main() {
    const baseProfile = [26, 26, 90, 26, 26, 90, 26, 26, 90, 26, 26, 90, 26, 26, 90, 26];
    const solarInput = [400, 400, 400, 400, 450, 450, 450, 450, 400, 400, 400, 400];

    const fileContent = fs.readFileSync("./../tp-link-logger/profile/Waschmaschine_60_Grad_Ende_18_47_plus_Nachlauf.csv", "utf-8");
    const lines = fileContent.split("\r\n");

    const firstDate = new Date(lines[0].split(";")[0]);
    let lastDate = addSeconds(firstDate, -1);

    const wattMinutes: number[] = [];

    for (const line of lines) {
        const date = new Date(lines[0].split(";")[0]);
        const value = Number.parseFloat(lines[0].split(";")[1]);

        const pastMinutes = (date.getTime() - firstDate.getTime()) / 1000 / 60;
        const pastQuarterHours = Math.floor(pastMinutes / 15);
        const currentProfileValue = baseProfile[pastQuarterHours];
        const currentSolarInputValue = solarInput[pastQuarterHours];
        const currentConsumption = value + currentProfileValue;

        const currentSelfConsumption = Math.min(currentSolarInputValue, currentConsumption);
        const timePassedSeconds = (date.getTime() - lastDate.getTime()) / 1000;
        const currentWattSeconds = currentConsumption.toFixed(4) * timePassedSeconds;

        const currentWattMinuteBatch = Math.floor(pastMinutes);

        const currentBatchValue = wattMinutes[currentWattMinuteBatch];
        wattMinutes[currentWattMinuteBatch] = currentBatchValue ? currentWattSeconds + currentBatchValue + currentWattSeconds;
        lastDate = date;
    }

    console.log(wattMinutes.reduce((accumulator, currentValue) => accumulator + currentValue / 60, 0))
}

//Invoke the main function
main().catch(err => {
    console.log(err);
});