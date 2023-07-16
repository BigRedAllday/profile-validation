import * as fs from "fs";
import {addSeconds} from "date-fns";

async function main() {
    const baseProfile = [26, 26, 90, 26, 26, 90, 26, 26, 90, 26, 26, 90, 26, 26, 90, 26];
    // const baseProfile = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const solarInput = [400, 400, 400, 400, 450, 450, 450, 450, 400, 400, 400, 400];

    const fileContent = fs.readFileSync("./../tp-link-logger/profile/Waschmaschine_30_Grad_Ende_11_01_plus_Nachlauf.csv", "utf-8");
    const lines = fileContent.split("\r\n");

    const firstDate = new Date(lines[1].split(";")[0]);
    let lastDate = addSeconds(firstDate, -1);

    const wattMinutesSelf: number[] = [];
    const wattMinutesTotal: number[] = [];

    for (const line of lines) {
        const date = new Date(line.split(";")[0]);
        const value = Number.parseFloat(line.split(";")[1]);
        if (!value) {
            // header, other bullshit
            continue;
        }

        const pastMinutes = (date.getTime() - firstDate.getTime()) / 1000 / 60;
        const pastQuarterHours = Math.floor(pastMinutes / 15);
        const currentProfileValue = baseProfile[pastQuarterHours];
        const currentSolarInputValue = solarInput[pastQuarterHours];
        const currentConsumption = value + currentProfileValue;

        const currentSelfConsumption = Math.min(currentSolarInputValue, currentConsumption);
        const timePassedSeconds = (date.getTime() - lastDate.getTime()) / 1000;
        const currentWattSecondsSelfConsumption = Number(currentSelfConsumption.toFixed(5)) * timePassedSeconds;
        const currentWattSecondsConsumption = Number(currentConsumption.toFixed(5)) * timePassedSeconds;

        const currentWattMinuteBatch = Math.floor(pastMinutes);

        const currentBatchValueSelf = wattMinutesSelf[currentWattMinuteBatch];
        wattMinutesSelf[currentWattMinuteBatch] = !currentBatchValueSelf
            ? currentWattSecondsSelfConsumption
            : currentBatchValueSelf + currentWattSecondsSelfConsumption;

        const currentBatchValueTotal = wattMinutesTotal[currentWattMinuteBatch];
        wattMinutesTotal[currentWattMinuteBatch] = !currentBatchValueTotal
            ? currentWattSecondsConsumption
            : currentBatchValueTotal + currentWattSecondsConsumption;
        lastDate = date;
    }

    const totalWattMinutesSelf = wattMinutesSelf.reduce((accumulator, currentValue) => accumulator + currentValue / 60, 0);
    const totalWattMinutesTotal = wattMinutesTotal.reduce((accumulator, currentValue) => accumulator + currentValue / 60, 0);

    console.log(`Self Consumption (Wh): ${totalWattMinutesSelf / 60}`);
    console.log(`Total Consumption (Wh): ${totalWattMinutesTotal / 60}`);
}

//Invoke the main function
main().catch(err => {
    console.log(err);
});