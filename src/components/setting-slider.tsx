import { CircleQuestionMark } from "lucide-react";
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useState } from "react";

interface Props{
	min?: number;
	defaultValue?: number;
	max?: number;
	step?: number;
	id: string;
	label: string;
	tooltip: string;
    onChange: (id: string, value: number) => void
}

const SettingSlider = ({min = 0.0, defaultValue = 0, max = 1.0, step = 0.01, id, label, tooltip, onChange}: Props) => {
    const [currentVal, setCurrentVal] = useState<number[]>([defaultValue]);

    const handleChange = (newValue: number[]) => {
        setCurrentVal(newValue)
        onChange(id, newValue[0])
    }
	return (
		<div className="flex flex-col gap-1 w-full">
				<div className="flex gap-1">
                    <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                            <CircleQuestionMark size={16} className="opacity-50 hover:opacity-100 transition-opacity"/>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[60ch]">
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
					<Label className="font-[400] text-xs" htmlFor={id}>{label}:</Label>
                    <p className="text-xs">{currentVal[0]}</p>
				</div>
				<Slider id={id} min={min} defaultValue={[defaultValue]} max={max} step={step} value={currentVal} onValueChange={handleChange} />
		</div>
	)
}
export default SettingSlider