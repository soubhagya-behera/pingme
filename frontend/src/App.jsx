import Button from "./components/ui/Button";

function App() {

  return (

    <div className="min-h-screen bg-slate-100 flex items-center justify-center">

      <div className="space-y-5">

        <Button>

          Primary Button

        </Button>

        <Button variant="secondary">

          Secondary

        </Button>

        <Button variant="danger">

          Danger

        </Button>

        <Button variant="ghost">

          Ghost

        </Button>

      </div>

    </div>

  );

}

export default App;