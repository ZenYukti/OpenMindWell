import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, getCurrentUser, getProfile, signOut } from '../lib/supabase';
import { roomsApi, resourcesApi, journalApi } from '../lib/api';
import ChatRoom from '../components/ChatRoom';

type Tab = 'rooms' | 'journal' | 'habits' | 'resources';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  mood?: number;
  tags?: string[];
  updated_at?: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('rooms');
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const session = await getSession();
    if (!session) {
      navigate('/');
      return;
    }

    const user = await getCurrentUser();
    if (user) {
      const { data } = await getProfile(user.id);
      setProfile(data);
    }

    setLoading(false);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Crisis Banner */}
      <div className="bg-red-600 text-white py-2 px-4 text-center text-xs">
        ⚠️ IN CRISIS? 🇺🇸 988 | 🇮🇳 9152987821 (iCall) | KIRAN 1800-599-0019
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{profile?.avatar || '😊'}</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profile?.nickname || 'User'}</h1>
              <p className="text-sm text-gray-500">OpenMindWell by ZenYukti</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="text-sm text-gray-600 hover:text-gray-900">
            Sign Out
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex gap-8">
            <TabButton active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')}>
              💬 Rooms
            </TabButton>
            <TabButton active={activeTab === 'journal'} onClick={() => setActiveTab('journal')}>
              📝 Journal
            </TabButton>
            <TabButton active={activeTab === 'habits'} onClick={() => setActiveTab('habits')}>
              ✅ Habits
            </TabButton>
            <TabButton active={activeTab === 'resources'} onClick={() => setActiveTab('resources')}>
              📚 Resources
            </TabButton>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'rooms' && <RoomsTab />}
        {activeTab === 'journal' && <JournalTab />}
        {activeTab === 'habits' && <HabitsTab />}
        {activeTab === 'resources' && <ResourcesTab />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
        active
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

function RoomsTab() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadRooms();
    loadCurrentUser();
  }, []);

  async function loadRooms() {
    try {
      const data = await roomsApi.getAll();
      setRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCurrentUser() {
    const user = await getCurrentUser();
    if (user) {
      const { data } = await getProfile(user.id);
      setCurrentUser({
        id: user.id,
        nickname: data?.nickname || 'Anonymous',
      });
    }
  }

  function handleJoinRoom(room: any) {
    if (!currentUser) {
      alert('Please wait, loading user information...');
      return;
    }
    setSelectedRoom(room);
  }

  if (loading) {
    return <div className="text-center py-8">Loading rooms...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Support Rooms</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 text-lg">💬</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{room.name}</h3>
                <p className="text-xs text-gray-500">{room.member_count || 0} members online</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{room.description}</p>
            <button
              onClick={() => handleJoinRoom(room)}
              className="btn-primary w-full text-sm"
            >
              Join Room →
            </button>
          </div>
        ))}
      </div>

      {/* Chat Room Modal */}
      {selectedRoom && currentUser && (
        <ChatRoom
          room={selectedRoom}
          currentUser={currentUser}
          onClose={() => setSelectedRoom(null)}
        />
      )}

      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">
          ✅ <strong>Real-time chat is now active!</strong> Join a room to connect with others anonymously.
        </p>
      </div>
    </div>
  );
}

function JournalTab() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadEntries() {
      try {
        const data = await journalApi.getAll();
        if (!isMounted) return;
        setEntries(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading journal entries:', err);
        if (!isMounted) return;
        setError('Failed to load journal entries.');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    loadEntries();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredEntries = normalizedQuery
    ? entries.filter((entry) => {
        const title = (entry.title || '').toLowerCase();
        const content = (entry.content || '').toLowerCase();
        return title.includes(normalizedQuery) || content.includes(normalizedQuery);
      })
    : entries;

  let content;

  if (loading) {
    content = (
      <div className="text-center py-8 text-gray-600">
        Loading your journal entries...
      </div>
    );
  } else if (entries.length === 0) {
    content = (
      <div className="text-center py-12 text-gray-500">
        No journal entries yet.
      </div>
    );
  } else if (normalizedQuery && filteredEntries.length === 0) {
    content = (
      <div className="text-center py-12 text-gray-500">
        No entries match your search.
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="card">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {entry.title || 'Untitled entry'}
              </h3>
              <span className="text-xs text-gray-500">
                {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : ''}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line max-h-24 overflow-hidden">
              {entry.content}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Journal</h2>
        <button className="btn-primary">+ New Entry</button>
      </div>

      <div className="mb-4 max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title or content..."
          className="input-field w-full"
        />
      </div>

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {content}
    </div>
  );
}

function HabitsTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Habits</h2>
        <button className="btn-primary">+ New Habit</button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-900">
          ✅ <strong>Habit tracking coming soon!</strong> Build positive daily routines.
        </p>
        <p className="text-sm text-green-800 mt-2">
          Track streaks, log completions, and celebrate your progress.
        </p>
      </div>
    </div>
  );
}

function ResourcesTab() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadResources();
  }, [filter]);

  async function loadResources() {
    try {
      const data = await resourcesApi.getAll(filter || undefined);
      setResources(data);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading resources...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mental Health Resources</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Categories</option>
          <option value="hotline">Crisis Hotlines</option>
          <option value="article">Articles</option>
          <option value="exercise">Exercises</option>
          <option value="video">Videos</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <div key={resource.id} className="card">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold">{resource.title}</h3>
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                {resource.category}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Learn More →
              </a>
            )}
          </div>
        ))}
      </div>

      {resources.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No resources found in this category.
        </div>
      )}
    </div>
  );
}
