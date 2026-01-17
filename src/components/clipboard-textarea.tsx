import { Clipboard } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Label } from './ui/label';
import { toast } from "sonner"

interface Props{
    value: string;
}

const clipboardTextarea = ({value}: Props) => {
    const handleClipboardButtonClick = async () => {
        await navigator.clipboard.writeText(value);
        toast.success("Output copied to clipboard!", {
            description: <p className='text-[12px] opacity-50 font-400'>Do not change any of the values when sending your bits message in chat!</p>
        })
    }
	return (
		<div className="relative w-full h-full max-h-[324px] flex flex-col gap-2 group max-[850px]:max-h-fit">
            <Tooltip delayDuration={150} disableHoverableContent>
                    <TooltipTrigger asChild>
                        <Button disabled={value === "Waiting for input..."} onClick={handleClipboardButtonClick} className="absolute top-8 right-3 aspect-square px-0! z-1 transition-opacity disabled:opacity-0 opacity-0 hover:opacity-100 group-hover:opacity-50">
                            <Clipboard />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-[10px] font-[500]">Copy to clipboard</p>
                    </TooltipContent>
                </Tooltip>
            <Label className="font-[400] text-xs" htmlFor={"output"}>Output</Label>
			<Textarea className="md:text-xs h-full w-100 resize-none max-[850px]:w-full max-[850px]:h-40" id="output" value={value} disabled />
		</div>
	);
};
export default clipboardTextarea;
