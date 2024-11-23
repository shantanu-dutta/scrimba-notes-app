import React from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Split from "react-split";
import { addDoc, onSnapshot, deleteDoc, setDoc } from "firebase/firestore";
import { getNoteRef, notesCollection } from "./firebase";

const LoadingState = {
  Loading: "Loading",
  Loaded: "Loaded",
  LoadError: "LoadError",
};

export default function App() {
  const [loadingState, setLoadingState] = React.useState(LoadingState.Loading);
  const [notes, setNotes] = React.useState([]);
  const [currentNoteId, setCurrentNoteId] = React.useState("");
  const [tempNoteText, setTempNoteText] = React.useState("");

  const currentNote =
    notes.find((note) => note.id === currentNoteId) || notes[0];

  React.useEffect(() => {
    return onSnapshot(notesCollection, (snapshot) => {
      console.log("notes updated.");
      const notesArr = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log("latest notes:", notesArr);
      setNotes(notesArr);
      setLoadingState(LoadingState.Loaded);
    });
  }, []);

  React.useEffect(() => {
    if (!currentNoteId) {
      console.log("updated current note id:", notes[0]?.id);
      setCurrentNoteId(notes[0]?.id);
    }
  }, [notes]);

  React.useEffect(() => {
    if (currentNote) {
      setTempNoteText(currentNote.body);
    }
  }, [currentNote]);

  React.useEffect(() => {
    console.log("update note started...");
    const timeoutId = setTimeout(() => {
      if (tempNoteText === currentNote.body) {
        console.log("note unchanged, not updating.");
        return;
      }
      updateNote(tempNoteText);
    }, 500);

    return () => {
      console.log("clearing update note timeout...");
      clearTimeout(timeoutId);
    };
  }, [tempNoteText]);

  async function createNewNote() {
    console.log("adding new note...");
    const newNote = {
      body: "# Type your markdown note's title here",
      createAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newNoteRef = await addDoc(notesCollection, newNote);
    console.log("new note added.");
    setCurrentNoteId(newNoteRef.id);
  }

  async function updateNote(text) {
    console.log("updating note id:", currentNoteId);
    const noteRef = getNoteRef(currentNoteId);
    await setDoc(
      noteRef,
      { body: text, updatedAt: Date.now() },
      { merge: true }
    );
    console.log("note updated.");
  }

  async function deleteNote(event, noteId) {
    event.stopPropagation();
    console.log("deleting note id:", noteId);
    const noteRef = getNoteRef(noteId);
    await deleteDoc(noteRef);
    console.log("note deleted.");
  }

  const sortedNotes = notes.toSorted((a, b) => b.updatedAt - a.updatedAt);
  console.log("Sorted notes by update date: ", sortedNotes);

  console.log("current note:", currentNote);
  console.log("tempNoteText:", tempNoteText);

  return (
    <main>
      {loadingState === LoadingState.Loading ? (
        <div className="no-notes">
          <h1>Loading notes...</h1>
        </div>
      ) : loadingState === LoadingState.Loaded ? (
        notes.length > 0 ? (
          <Split sizes={[30, 70]} direction="horizontal" className="split">
            <Sidebar
              notes={sortedNotes}
              currentNote={currentNote}
              setCurrentNoteId={setCurrentNoteId}
              newNote={createNewNote}
              deleteNote={deleteNote}
            />
            <Editor
              tempNoteText={tempNoteText}
              setTempNoteText={setTempNoteText}
            />
          </Split>
        ) : (
          <div className="no-notes">
            <h1>You have no notes</h1>
            <button className="first-note" onClick={createNewNote}>
              Create one now
            </button>
          </div>
        )
      ) : (
        <div className="no-notes">
          <h1>Error fetching notes.</h1>
        </div>
      )}
    </main>
  );
}
