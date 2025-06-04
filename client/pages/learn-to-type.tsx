import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { PixelButton } from "@/components/ui/pixel-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, Zap, Trophy } from "lucide-react";

export default function LearnToType() {
  const [, setLocation] = useLocation();
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Learn to Type Adventure - Chicken Jockey Scribe Racer";
  }, []);

  const lessons = [
    {
      id: 1,
      title: "Home Row Heroes",
      description: "Master the foundation keys: A S D F J K L ;",
      difficulty: "Beginner",
      duration: "5-10 min",
      icon: <Target className="w-6 h-6" />,
      unlocked: true,
      completed: false
    },
    {
      id: 2,
      title: "Top Row Rangers",
      description: "Conquer the number row and upper letters",
      difficulty: "Beginner",
      duration: "8-12 min",
      icon: <Zap className="w-6 h-6" />,
      unlocked: true,
      completed: false
    },
    {
      id: 3,
      title: "Bottom Row Bandits",
      description: "Tame the tricky bottom row keys",
      difficulty: "Intermediate",
      duration: "10-15 min",
      icon: <BookOpen className="w-6 h-6" />,
      unlocked: true,
      completed: false
    },
    {
      id: 4,
      title: "Special Character Squad",
      description: "Master punctuation and special symbols",
      difficulty: "Intermediate",
      duration: "12-18 min",
      icon: <Trophy className="w-6 h-6" />,
      unlocked: true,
      completed: false
    },
    {
      id: 5,
      title: "Speed Demon Challenge",
      description: "Put it all together for maximum WPM",
      difficulty: "Advanced",
      duration: "15-20 min",
      icon: <Zap className="w-6 h-6" />,
      unlocked: true,
      completed: false
    }
  ];

  const startLesson = (lessonId: number) => {
    // For now, redirect to practice mode
    // In the future, this could be a dedicated lesson interface
    setLocation("/practice");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-minecraft text-primary mb-4">
            LEARN TO TYPE ADVENTURE
          </h1>
          <p className="text-lg text-light max-w-2xl mx-auto">
            Embark on a journey to master the keyboard! Progress through interactive lessons
            designed to build your typing skills from the ground up.
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="bg-dark border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-minecraft text-primary">Your Progress</h2>
              <Badge variant="outline" className="bg-green-900/50 text-green-400">
                0/5 Lessons Complete
              </Badge>
            </div>
            <Progress value={0} className="h-3 mb-2" />
            <p className="text-sm text-gray-400">
              Complete lessons to unlock new challenges and improve your typing speed!
            </p>
          </CardContent>
        </Card>

        {/* Lesson Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {lessons.map((lesson) => (
            <Card
              key={lesson.id}
              className={`bg-dark border-2 transition-all cursor-pointer ${
                selectedLesson === lesson.id
                  ? "border-primary shadow-lg"
                  : "border-gray-700 hover:border-gray-600"
              }`}
              onClick={() => setSelectedLesson(lesson.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-primary">{lesson.icon}</div>
                    <div>
                      <h3 className="font-minecraft text-lg text-primary">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-400">{lesson.duration}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      lesson.difficulty === "Beginner"
                        ? "bg-green-900/50 text-green-400"
                        : lesson.difficulty === "Intermediate"
                        ? "bg-yellow-900/50 text-yellow-400"
                        : "bg-red-900/50 text-red-400"
                    }
                  >
                    {lesson.difficulty}
                  </Badge>
                </div>

                <p className="text-sm text-light mb-4">{lesson.description}</p>

                <PixelButton
                  variant={selectedLesson === lesson.id ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    startLesson(lesson.id);
                  }}
                >
                  {lesson.completed ? "Review Lesson" : "Start Lesson"}
                </PixelButton>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500">
            <CardContent className="p-6">
              <h3 className="font-minecraft text-lg text-purple-400 mb-2">
                Typing Test
              </h3>
              <p className="text-sm text-light mb-4">
                Test your current typing speed and accuracy
              </p>
              <PixelButton
                variant="outline"
                size="sm"
                onClick={() => setLocation("/placement")}
              >
                Take Test
              </PixelButton>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-900/50 to-teal-900/50 border-green-500">
            <CardContent className="p-6">
              <h3 className="font-minecraft text-lg text-green-400 mb-2">
                Practice Mode
              </h3>
              <p className="text-sm text-light mb-4">
                Free practice with various text difficulty levels
              </p>
              <PixelButton
                variant="outline"
                size="sm"
                onClick={() => setLocation("/practice")}
              >
                Free Practice
              </PixelButton>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <PixelButton variant="secondary" onClick={() => setLocation("/")}>
            Back to Main Menu
          </PixelButton>
        </div>
      </main>

      <Footer />
    </div>
  );
}