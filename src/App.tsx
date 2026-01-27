import { Button } from './components/ui/button';
import { CircleQuestionMark, LucidePlay } from 'lucide-react';
import { Separator } from './components/ui/separator';
import { Spinner } from './components/ui/spinner';
import { Textarea } from './components/ui/textarea';
import { ThemeProvider } from './components/theme-provider';
import { ThemeToggle } from './components/theme-toggle';
import { toast } from 'sonner';
import { Toaster } from "@/components/ui/sonner"
import { useEffect, useState } from 'react';
import ClipboardTextarea from './components/clipboard-textarea';
import gsap from 'gsap';
import SettingSlider from './components/setting-slider';
import { Label } from './components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

function App() {
    const [model, setModel] = useState("eleven_turbo_v2");
    const settings = model === "eleven_v3" ? {
        stability: 0.5
    } : {
        speed: 1.0,
        similarityBoost: 0.75,
        stability: 0.5
    }
    const [values, setValues] = useState({
        model: model === 'eleven_v3' ? 'v3' : 'v2',
        ...settings,
        originalMessage: ""
    });

    const [output, setOutput] = useState("");
    const [showRateLimitNotice, setShowRateLimitNotice] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const messageSeparator = "_"
    let maxLength = 500 - ("!say " + Object.values(values).join(messageSeparator)).length + values.originalMessage.length;

    useEffect(() => {
        const sendQuery = async () => {
            const params = new URLSearchParams(window.location.search);
            if(params.size === 0) return;
            
            const password = params.get("password") ? params.get("password") : "";
            
            const res = await fetch(`/api/?password=${encodeURIComponent(password != null ? password : "")}`, {
                method: 'GET',
                credentials: "include"
            });
            
            if(res.ok && params.size > 0) window.location.href = window.origin;
        }
        sendQuery();

        gsap.to('.main-container > *', {
            opacity: 1,
            duration: 0.3,
            stagger: 0.1,
            delay: 0.2,
            ease: 'sine.in',
        });
    }, [])

    const [noticeVisible, setNoticeVisible] = useState(true);
    useEffect(() => {
        gsap.to('.footer-notice', {
            opacity: 0,
            duration: 0.5,
            stagger: 0.15,
            ease: 'sine.in',
            onComplete: () => {
                setNoticeVisible(model === "eleven_v3")
                setTimeout(() => {
                    gsap.to('.footer-notice', {
                        opacity: 1,
                        duration: 1,
                        stagger: 0.15,
                        ease: 'sine.in',
                    })
                }, 50);
            }
        })
        setValues({
            model: model === 'eleven_v3' ? 'v3' : 'v2',
            ...settings,
            originalMessage: values.originalMessage
        })
        maxLength = 500 - ("!say " + Object.values(values).join(messageSeparator)).length - values.originalMessage.length;
    }, [model])
    
    const handleTextareaChange = ( e: React.ChangeEvent<HTMLTextAreaElement> ) => {
        setValues((prev) => ({ ...prev, originalMessage: e.target.value, }))
    }
        
    const handleSliderChange = (id: string, value: number) => {
        setValues((prev) => ({ ...prev, [id]: value, originalMessage: values.originalMessage }))
    }
    
    useEffect(() => {
        const newOutput = {
            ...values,
            originalMessage: values.originalMessage.substring(0, maxLength)
        }
        setOutput(Object.values(newOutput).join(messageSeparator))
    }, [values])

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
      }, [])

    const playTestSample = async () => {
        setDisabled(true)
        const response = await fetch('/api/play-test-sample', {
			method: 'POST',
            credentials: "include",
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({...values, model: model}),
		});

		if (response.ok) setDisabled(false);
        if(response.status === 429){
		    setDisabled(false);
            setShowRateLimitNotice(true);
            gsap.to('.rate-limit-notice', {
                opacity: 1,
                duration: 0.5,
                ease: 'sine.in'
            });
            toast.warning("You're being rate limited", {
                description: <p className='text-[12px] opacity-50 font-400'>Try again in 5 minutes.</p>
            })
        }

		const blob = await response.blob();
		const url = URL.createObjectURL(blob);

		const audio = new Audio(url);
		audio.play();
    }

	return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Toaster position="top-center"/>
			<div className="main-container flex relative h-full items-center gap-4 w-fit h-fit max-[850px]:flex-col max-[850px]:w-full max-[850px]:px-8 max-[850px]:justify-center">
                {showRateLimitNotice && <p className='rate-limit-notice absolute top-[10%] text-[12px] text-zinc-500 font-400 text-center w-full max-[850px]:top-[2%] opacity-0'>The site is mostly used for formatting the end output.<br/>The audio sample will say the same sentence regardless of your input.<br/>It will only react to the slider setting change so there isn't much point in playing it over and over.</p>}
				<div className="w-full flex flex-col gap-4 items-center opacity-0">
                    <div className='w-full flex justify-between'>
                        <div className='flex gap-1'>
                        <Tooltip delayDuration={250}>
                            <TooltipTrigger>
                                <CircleQuestionMark size={16} className="opacity-50 hover:opacity-100 transition-opacity"/>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[60ch]">
                                <p>The model to use for the TTS</p>
                                <Separator orientation='horizontal' className='' />
                                <ul>
                                    <li><p>Eleven Turbo V2</p></li>
                                    <ul className='list-disc ml-4'>
                                        <li>Resembles the original audio samples more closely</li>
                                        <li>Has more adjustable settings</li>
                                        <li>The flow of the speech is controled with punctuation.</li>
                                    </ul>
                                    <li>Eleven V3 (alpha)</li>
                                    <ul className='list-disc ml-4'>
                                        <li>The audio may not sound like the original samples</li>
                                        <li>Very limited adjustable settings</li>
                                        <li>supports tags, e.g. [excited]</li>
                                    </ul>
                                </ul>
                            </TooltipContent>
                        </Tooltip>
                        <Label className="font-[400] text-xs" htmlFor='combobox'>Model:</Label>
                        </div>
                        <Select defaultValue='eleven_turbo_v2' onValueChange={(value) => setModel(value)}>
                            <SelectTrigger className="w-40 !py-0 !text-[12px] !h-7" size='sm'>
                                <SelectValue placeholder="Theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className='!text-[12px]' value="eleven_turbo_v2">Eleven Turbo V2</SelectItem>
                                <SelectItem className='!text-[12px]' value="eleven_v3">Eleven V3 (alpha)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {model === 'eleven_turbo_v2' && <>
                        <SettingSlider onChange={handleSliderChange} id="speed" label="Speed" min={0.7} defaultValue={settings.speed} max={1.2} tooltip='Adjusts the speed of the voice. A value of 1.0 is the default speed, while values less than 1.0 slow down the speech, and values greater than 1.0 speed it up.'/>
                        <SettingSlider onChange={handleSliderChange} id="similarityBoost" label="Similarity Boost" defaultValue={settings.similarityBoost} tooltip='Determines how closely the AI should adhere to the original voice when attempting to replicate it.'/>
                        <SettingSlider onChange={handleSliderChange} id="stability" label="Stability"  defaultValue={settings.stability} tooltip='Determines how stable the voice is and the randomness between each generation. Lower values introduce broader emotional range for the voice. Higher values can result in a monotonous voice with limited emotion.'/>
                    </>}
                    {model === 'eleven_v3' && <>
                        <SettingSlider onChange={handleSliderChange} step={0.5} id="stability" label="Stability"  defaultValue={settings.stability} tooltip='Determines how stable the voice is and the randomness between each generation. Lower values introduce broader emotional range for the voice. Higher values can result in a monotonous voice with limited emotion.'>
                            <div className="flex justify-between text-[10px] text-zinc-500 font-400 mb-1">
                                <p>Creative</p>
                                <p>Neutral</p>
                                <p>Robust</p>
                            </div>
                        </SettingSlider>
                    </>}
					
                    <div className='relative mt-4 max-[850px]:w-full'>
                        <div className='absolute z-1 -top-7 right-0 align-middle'>
                            <p className={`inline text-[10px] ${values.originalMessage.length > maxLength ? 'text-[#ed1b53]' : 'text-zinc-500'} font-400 transition-colors`}>{values.originalMessage.length}</p>
                            <p className='inline text-[10px] text-zinc-500 font-400'>/{maxLength}</p>
                        </div>
                        <Textarea maxLength={maxLength} onChange={handleTextareaChange} id="originalMessage" placeholder="Your TTS message" className={`md:text-xs w-100 resize-y max-[850px]:w-full ${model === "eleven_v3" ?  "h-29" : "min-h-14"}`}/>
                    </div>
					
                    <Button className='w-full' onClick={() => playTestSample()} disabled={disabled}> {disabled ? <Spinner /> : <LucidePlay fill='currentColor'/>} Play test sample </Button>
                    <p className='text-[10px] opacity-50 font-400'>The site will play a preset sample which reacts to your settings to save on tokens</p>
				</div>

				<Separator orientation={windowWidth <= 850 ? 'horizontal' : 'vertical'} className='max-h-[324px] opacity-0' />
				<ClipboardTextarea value={values.originalMessage === "" ? "Waiting for input..." : output} />
			</div>

            <div className='w-full text-[12px] text-zinc-500 font-400 absolute bottom-5 text-center cursor-default select-none max-[850px]:bottom-[1%] max-[850px]:text-[10px]'>
                {noticeVisible && <>
                    <div className='footer-notice opacity-0'>Tip: Use tone indicators in <p className='inline text-zinc-400 hover:text-zinc-200 transition-colors'>[brackets]</p> to make the output more interesting.</div>
                    <div className='footer-notice opacity-0'>For example: <p className='inline text-zinc-400 hover:text-zinc-200 transition-colors'>[excited] This is so much fun!</p></div>
                </>}
                <div className='footer-notice opacity-0'>For more information read <a target='_blank' className='inline underline text-zinc-400 hover:text-zinc-200 transition-colors' href={`https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices${model === "eleven_v3" ? "#prompting-eleven-v3-alpha" : ""}`}>the docs</a></div>
            </div>

            <div className="absolute top-5 right-5">
				<ThemeToggle />
			</div>

		</ThemeProvider>
	);
}

export default App;
