import { Check, Clipboard } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Label } from './ui/label';
import { toast } from "sonner"
import gsap from 'gsap';

interface Props{
    value: string;
}

const clipboardTextarea = ({value}: Props) => {
    let tl = gsap.timeline()

    const handleClipboardButtonClick = async () => {
        await navigator.clipboard.writeText(value);
        toast.success("Output copied to clipboard!", {
            description: <p className='text-[12px] opacity-50 font-400'>Do not change any of the values when sending your bits message in chat!</p>
        })
        tl.to('.clipboard', { scale: 0, duration: 0.1 });
        tl.to('.check', { scale: 1, duration: 0.2, delay: -0.05 });

        tl.to('.check', { scale: 0, duration: 0.1, delay: 2 });
        tl.to('.clipboard', { scale: 1, duration: 0.2, delay: -0.05 });
    }

	return (
		<div className="relative w-full h-full max-h-[324px] flex flex-col gap-2 group max-[850px]:max-h-fit opacity-0">
            <Tooltip delayDuration={150} disableHoverableContent>
                    <TooltipTrigger asChild>
                        <Button size={'sm'} disabled={value === "Waiting for input..."} onClick={handleClipboardButtonClick} className="absolute top-8 right-3 aspect-square px-0! z-1 transition-opacity disabled:opacity-0 opacity-0 hover:opacity-100 group-hover:opacity-50">
                            <Check className='check inline-block absolute scale-0'/>
                            <Clipboard className='clipboard inline-block' />
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
