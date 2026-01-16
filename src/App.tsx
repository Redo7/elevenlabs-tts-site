import { LucidePlay } from 'lucide-react';
import SettingSlider from './components/setting-slider';
import { ThemeProvider } from './components/theme-provider';
import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';
import { Textarea } from './components/ui/textarea';
import ClipboardTextarea from './components/clipboard-textarea';
import { useEffect, useState } from 'react';
import { Spinner } from './components/ui/spinner';
import { Toaster } from "@/components/ui/sonner"

function App() {

    const [values, setValues] = useState({
        stability: 0.5,
        originalMessage: ""
    });

    const [output, setOutput] = useState("");
    const [disabled, setDisabled] = useState(false);
    const messageSeparator = "_"
    const maxLength = 500 - (values.stability + messageSeparator).length;

    useEffect(() => {
        const sendQuery = async () => {
            const params = new URLSearchParams(window.location.search);
            const password = params.get("password") ? params.get("password") : "";
            
            const res = await fetch(`/api/?password=${encodeURIComponent(password != null ? password : "")}`, {
                method: 'GET',
                credentials: "include"
            });
            
            if(res.ok && params.size > 0) window.location.href = window.origin;
        }
        sendQuery();
    }, [])
    
    const handleTextareaChange = ( e: React.ChangeEvent<HTMLTextAreaElement> ) => {
        setValues((prev) => ({ ...prev, originalMessage: e.target.value, }))
    }
        
    const handleSliderChange = (id: string, value: number) => {
        setValues((prev) => ({ ...prev, [id]: value, originalMessage: values.originalMessage }))
    }
    
    useEffect(() => {
        setOutput(values.stability + messageSeparator + values.originalMessage.substring(0, maxLength))
    }, [values])

    const playTestSample = async () => {
        setDisabled(true)
        const response = await fetch('/api/play-test-sample', {
			method: 'POST',
            credentials: "include",
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(values),
		});

		if (response.ok) setDisabled(false);

		const blob = await response.blob();
		const url = URL.createObjectURL(blob);

		const audio = new Audio(url);
		audio.play();
    }

	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<div className="flex items-stretch gap-4 w-200 h-fit max-[768px]:flex-col max-[768px]:w-full max-[768px]:px-8">
                <Toaster position="top-center" className='!absolute'/>
				<div className="w-full flex flex-col gap-4 items-center">
					<SettingSlider onChange={handleSliderChange} step={0.5} id="stability" label="Stability"  defaultValue={0.5} tooltip='Determines how stable the voice is and the randomness between each generation. Lower values introduce broader emotional range for the voice. Higher values can result in a monotonous voice with limited emotion.'>
                        <div className="flex justify-between text-[10px] text-zinc-500 font-400 mb-1">
                            <p>Creative</p>
                            <p>Neutral</p>
                            <p>Robust</p>
                        </div>
                    </SettingSlider>
					
                    <div className='relative mt-4 max-[768px]:w-full'>
                        <div className='absolute z-1 -top-6 right-0'>
                            <p className={`inline text-[10px] ${values.originalMessage.length > maxLength ? 'text-[#ed1b53]' : 'text-zinc-500'} font-400`}>{values.originalMessage.length}</p>
                            <p className='inline text-[10px] text-zinc-500 font-400'>/{maxLength}</p>
                        </div>
                        <Textarea maxLength={maxLength} onChange={handleTextareaChange} id="originalMessage" placeholder="Your TTS message" className='md:text-xs w-100 h-40 resize-y max-[768px]:w-full'/>
                    </div>
					
                    <Button className='w-full' onClick={() => playTestSample()} disabled={disabled}> {disabled ? <Spinner /> : <LucidePlay fill='currentColor'/>} Play test sample </Button>
                    <p className='text-[10px] opacity-50 font-400'>The site will play a short sample which reacts to your settings to conserve on tokens spent</p>
				</div>

				<Separator orientation='vertical' className='data-[orientation=vertical]:h-auto' />
				<ClipboardTextarea value={values.originalMessage === "" ? "Waiting for input..." : output} />
			</div>

            <div className='text-[10px] text-zinc-500 font-400 absolute bottom-5 left-50% -transformX-[50%] text-center cursor-default select-none'>
                Tip: Use tone indicators in <p className='inline text-zinc-400 hover:text-zinc-200 transition-colors'>[brackets]</p> to make the output more interesting.<br />
                For example: <p className='inline text-zinc-400 hover:text-zinc-200 transition-colors'>[excited] This is so much fun!</p><br />
                For more information read <a target='_blank' className='inline underline text-zinc-400 hover:text-zinc-200 transition-colors' href='https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices#prompting-eleven-v3-alpha'>the docs</a>
            </div>

            <div className="absolute top-5 right-5">
				<ThemeToggle />
			</div>

		</ThemeProvider>
	);
}

export default App;
