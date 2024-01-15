export type UnsavedEntry = {
  title: string;
  notes: string;
  photoUrl: string;
};
export type Entry = UnsavedEntry & {
  entryId: number;
};

const data = {
  entries: [] as Entry[],
  nextEntryId: 1,
};

window.addEventListener('beforeunload', function () {
  const dataJSON = JSON.stringify(data);
  // localStorage.setItem('code-journal-data', dataJSON);
});

// const localData = localStorage.getItem('code-journal-data');
// if (localData) {
//   data = JSON.parse(localData);
// }



export async function readEntries(): Promise<Entry[]> {
  const req = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const res = await fetch('/api/entries', req);
    if (!res.ok) throw new Error(`fetch Error ${res.status}`);
  return await res.json();
}

// const result = fetch('/api/entries')

export async function addEntry(entry: UnsavedEntry): Promise<Entry> {
  const req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  };
  const res = await fetch('/api/entries', req);
  if (!res.ok) throw new Error(`fetch Error ${res.status}`);
  return await res.json();
}

export function updateEntry(entry: Entry): Entry {
  const newEntries = data.entries.map((e) =>
    e.entryId === entry.entryId ? entry : e
  );
  data.entries = newEntries;
  return entry;
}

export function removeEntry(entryId: number): void {
  const updatedArray = data.entries.filter(
    (entry) => entry.entryId !== entryId
  );
  data.entries = updatedArray;
}
