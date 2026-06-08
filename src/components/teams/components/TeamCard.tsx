'use client';

import React from 'react';
import { Card, Avatar, Tag, Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Text } = Typography;
interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
  department: string;
  members: number;
}


interface TeamCardProps {
    team: Team;
    view: 'grid' | 'list';
}

const TeamCard: React.FC<TeamCardProps> = ({ team, view }) => {
    const router = useRouter();

    return (
        <Card
            hoverable
            onClick={() => router.push(`/teams/${team.id}`)}
            style={{
                borderRadius: 16,
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s',
            }}
            styles={{ body: { padding: view === 'list' ? '16px 24px' : 24 } }}
        >
            <div style={view === 'list' ? { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } : {}}>
                <div style={view === 'list' ? { display: 'flex', alignItems: 'center', gap: 16 } : {}}>
                    <div
                        style={{
                            width: view === 'list' ? 40 : 48,
                            height: view === 'list' ? 40 : 48,
                            borderRadius: 14,
                            background: `${team.color}12`,
                            color: team.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: view === 'list' ? 18 : 22,
                            marginBottom: view === 'list' ? 0 : 16,
                        }}
                    >
                        <TeamOutlined />
                    </div>
                    <div>
                        <h3 style={{ fontSize: view === 'list' ? 15 : 16, fontWeight: 700, margin: '0 0 4px' }}>{team.name}</h3>
                        {view === 'grid' && (
                            <Text
                                style={{
                                    color: 'var(--muted)',
                                    fontSize: 13,
                                    display: 'block',
                                    marginBottom: 16
                                }}
                            >
                                {team.description}
                            </Text>
                        )}
                    </div>
                </div>
                <div
                    style={view === 'list'
                        ? { display: 'flex', alignItems: 'center', gap: 24 }
                        : { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
                    }
                >
                    <Tag
                        color="blue"
                        style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}
                    >
                        {team.department}
                    </Tag>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar.Group max={{ count: 3 }} size={28} style={{ marginRight: 8 }}>
                            {Array.from({ length: Math.min(team.members, 4) }).map((_, i) => (
                                <Avatar
                                    key={i}
                                    style={{ background: team.color, fontWeight: 700, fontSize: 10 }}
                                    size={28}
                                >
                                    {String.fromCharCode(65 + i)}
                                </Avatar>
                            ))}
                        </Avatar.Group>
                        <Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
                            {team.members}
                        </Text>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default TeamCard;
