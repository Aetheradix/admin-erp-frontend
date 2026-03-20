import React from 'react';
import { Card, Rate, Input, Button, Typography, Space, App, Modal } from 'antd';
import { Smile, Frown, Meh, Heart, Activity } from 'lucide-react';
import { useSubmitMoodMutation } from '@/store/api/moodSlice';

const { Title, Text } = Typography;

interface MoodCheckInProps {
    open: boolean;
    onClose: () => void;
}

const MoodCheckIn: React.FC<MoodCheckInProps> = ({ open, onClose }) => {
    const [form] = Rate.useForm ? [null] : [null]; // Using simple state for simplicity
    const [mood, setMood] = React.useState(3);
    const [stress, setStress] = React.useState(2);
    const [comments, setComments] = React.useState('');
    const [submitMood, { isLoading }] = useSubmitMoodMutation();
    const { message } = App.useApp();

    const handleSubmit = async () => {
        try {
            await submitMood({
                mood_score: mood,
                stress_level: stress,
                comments
            }).unwrap();
            message.success('Mood logged: Your well-being is our priority.');
            onClose();
        } catch (error: any) {
            message.error(error.data?.message || 'Protocol failure: Sync aborted.');
        }
    };

    const desc = ['Extremely Low', 'Low', 'Average', 'Good', 'Excellent'];

    return (
        <Modal
            title={<Title level={4} className="text-white m-0 flex items-center gap-2">
                <Heart size={20} className="text-primary" />
                Wellness Synchronization
            </Title>}
            open={open}
            onCancel={onClose}
            footer={null}
            className="glass-modal"
            width={450}
        >
            <Space direction="vertical" className="w-full py-4" size={24}>
                <div>
                    <Text className="text-muted block mb-3 uppercase tracking-widest text-[10px] font-black">How do you feel today?</Text>
                    <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                        <Rate 
                            tooltips={desc} 
                            onChange={setMood} 
                            value={mood} 
                            character={({ index }: any) => {
                                const icons = [<Frown />, <Meh />, <Meh />, <Smile />, <Smile />];
                                return icons[index || 0];
                            }}
                            className="text-primary text-3xl"
                        />
                        <Text className="text-primary font-bold">{desc[mood - 1]}</Text>
                    </div>
                </div>

                <div>
                    <Text className="text-muted block mb-3 uppercase tracking-widest text-[10px] font-black">Stress Complexity Level</Text>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                        <Rate 
                            count={5} 
                            onChange={setStress} 
                            value={stress}
                            character={<Activity size={24} />}
                            className="text-red-400"
                        />
                        <div className="flex justify-between mt-2 px-1 text-[10px] text-muted uppercase font-bold opacity-30">
                            <span>Optimal</span>
                            <span>System Overload</span>
                        </div>
                    </div>
                </div>

                <div>
                    <Text className="text-muted block mb-3 uppercase tracking-widest text-[10px] font-black">Additional Context (Optional)</Text>
                    <Input.TextArea 
                        rows={3} 
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Any patterns or feedback for HR?" 
                        className="glass-input border-white/10 hover:border-primary/50"
                    />
                </div>

                <Button 
                    type="primary" 
                    block 
                    size="large" 
                    loading={isLoading}
                    onClick={handleSubmit}
                    className="h-14 rounded-2xl font-bold tracking-widest shadow-xl shadow-primary/20"
                >
                    COMMIT TO RECORD
                </Button>
            </Space>
        </Modal>
    );
};

export default MoodCheckIn;
