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
        style: 0,
        speed: 1.0,
        similarityBoost: 0.75,
        stability: 0.5,
        originalMessage: ""
    });

    const [output, setOutput] = useState("");
    const [disabled, setDisabled] = useState(false);
    const messageSeparator = "_*"

    useEffect(() => {
        const sendQuery = async () => {
            const params = new URLSearchParams(window.location.search);
            const password = params.get("password") ? params.get("password") : "";
            
            await fetch(`/api/?password=${encodeURIComponent(password != null ? password : "")}`, {
                method: 'GET',
                credentials: "include"
            });
        }
        sendQuery();
    }, [])
    
    const handleTextareaChange = ( e: React.ChangeEvent<HTMLTextAreaElement> ) => {
        setValues((prev) => ({ ...prev, originalMessage: e.target.value, }))
    }
        
    const handleSliderChange = (id: string, value: number) => {
        setValues((prev) => ({ ...prev, [id]: value }))
    }
    
    useEffect(() => {
        setOutput(values.style + messageSeparator + values.speed + messageSeparator + values.similarityBoost + messageSeparator + values.stability + messageSeparator + values.originalMessage)
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
					<SettingSlider onChange={handleSliderChange} id="style" label="Style" tooltip='Determines the style exaggeration of the voice. This setting attempts to amplify the style of the original speaker. It does consume additional computational resources and might increase latency if set to anything other than 0.'/>
					<SettingSlider onChange={handleSliderChange} id="speed" label="Speed" min={0.7} defaultValue={1.0} max={1.2} tooltip='Adjusts the speed of the voice. A value of 1.0 is the default speed, while values less than 1.0 slow down the speech, and values greater than 1.0 speed it up.'/>
					<SettingSlider onChange={handleSliderChange} id="similarityBoost" label="Similarity Boost" defaultValue={0.75} tooltip='Determines how closely the AI should adhere to the original voice when attempting to replicate it.'/>
					<SettingSlider onChange={handleSliderChange} id="stability" label="Stability"  defaultValue={0.5} tooltip='Determines how stable the voice is and the randomness between each generation. Lower values introduce broader emotional range for the voice. Higher values can result in a monotonous voice with limited emotion.'/>
					
                    <div className='relative mt-4 max-[768px]:w-full'>
                        <p className='absolute text-[10px] text-zinc-500 font-400 z-1 -top-6 right-0'>{values.originalMessage.length}/476</p>
                        <Textarea maxLength={476} onChange={handleTextareaChange} id="originalMessage" placeholder="Your TTS message" className='md:text-xs w-100 resize-y max-[768px]:w-full'/>
                    </div>
					
                    <Button className='w-full' onClick={() => playTestSample()} disabled={disabled}> {disabled ? <Spinner /> : <LucidePlay fill='currentColor'/>} Play test sample </Button>
                    <p className='text-[10px] opacity-50 font-400'>The site will play a short sample which reacts to your settings to conserve on tokens spent</p>
				</div>

				<Separator orientation='vertical' className='data-[orientation=vertical]:h-auto' />
				<ClipboardTextarea value={values.originalMessage === "" ? "Waiting for input..." : output} />
			</div>

            <div className="absolute top-5 right-5">
				<ThemeToggle />
			</div>

		</ThemeProvider>
	);
}

export default App;
