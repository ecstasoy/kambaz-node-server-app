let module = {
    id: "CS101",
    name: "Introduction to Computer Science",
    description: "Basic concepts of programming and computer science fundamentals",
    course: "CS"
};

let assignment = {
    id: 1,
    title: "NodeJS Assignment",
    description: "Create a NodeJS server with working endpoints",
    due: "2021-10-10",
    completed: false,
    score: 0,
};

export default function WorkingWithObjects(app) {
    
    app.get("/lab5/module", (req, res) => {
        res.json(module);
    });

    app.get("/lab5/module/name", (req, res) => {
        res.json(module.name);
    });

    app.get("/lab5/module/name/:name", (req, res) => {
        const { name } = req.params;
        module.name = name;
        res.json(module);
    });

    app.get("/lab5/module/description", (req, res) => {
        res.json(module.description);
    });

    app.get("/lab5/module/description/:description", (req, res) => {
        const { description } = req.params;
        module.description = description;
        res.json(module);
    });

    app.get("/lab5/assignment", (req, res) => {
        res.json(assignment);
    });

    app.get("/lab5/assignment/title", (req, res) => {
        res.json(assignment.title);
    });

    app.get("/lab5/assignment/title/:title", (req, res) => {
        const { title } = req.params;
        assignment.title = title;
        res.json(assignment);
    });

    app.get("/lab5/assignment/score", (req, res) => {
        res.json(assignment.score);
    });

    app.get("/lab5/assignment/score/:score", (req, res) => {
        const { score } = req.params;
        assignment.score = parseInt(score);
        res.json(assignment);
    });

    app.get("/lab5/assignment/completed", (req, res) => {
        res.json(assignment.completed);
    });

    app.get("/lab5/assignment/completed/:completed", (req, res) => {
        const { completed } = req.params;
        assignment.completed = completed === "true";
        res.json(assignment);
    });
}