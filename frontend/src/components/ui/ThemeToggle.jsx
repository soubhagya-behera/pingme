import { Moon, Sun } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ className = "" }){

    const {

        theme,

        toggleTheme

    } = useTheme();

    return(

        <button

            onClick={toggleTheme}

            aria-label="Toggle theme"

            className={`theme-toggle-button ${className}`}

        >

            {

                theme==="light"

                ?

                <Moon size={20}/>

                :

                <Sun size={20}/>

            }

        </button>

    );

}
