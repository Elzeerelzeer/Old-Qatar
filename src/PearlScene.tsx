from pathlib import Path

src = Path("/mnt/data/fix/PearlScene_fix.tsx")
text = src.read_text(encoding="utf-8")

# Remove duplicated points from reward titles.
text = text.replace("title:\n        'الدانة! +50',", "title:\n        'الدانة!',")
text = text.replace("title:\n          'لؤلؤة! +10',", "title:\n          'لؤلؤة!',")

# Make the Dana explanatory copy shorter.
text = text.replace(
    "'وجدت الدانة، لؤلؤة كبيرة ثمينة.'",
    "'وجدت الدانة، وهي من أثمن اللآلئ.'"
)

# Make the pearl copy concise too.
text = text.replace(
    "'عثرت على لؤلؤة جميلة.'",
    "'عثرت على لؤلؤة.'"
)

# When closing a Dana result, immediately surface the ascent action visually
# via existing hasFoundDana state; no phase change here, so the user can choose ascent.
# Improve the CTA label.
text = text.replace(">أكمل الغوص<", ">متابعة<")

# Make success action prominent and explicit.
text = text.replace(
"""            اصعد إلى المحمل""",
"""            اصعد إلى المحمل بالدانة"""
)

# Add a fixed success banner when Dana found and modal closed.
needle = """      {/* ======================================================
          DANA SUCCESS ACTION
      ====================================================== */}

      {phase ===
        'underwater' &&
        hasFoundDana &&
        !openedShell && (
          <button"""
replacement = """      {/* ======================================================
          DANA SUCCESS ACTION
      ====================================================== */}

      {phase ===
        'underwater' &&
        hasFoundDana &&
        !openedShell && (
          <>
            <div
              className="
                fixed
                left-1/2
                top-5
                -translate-x-1/2
                z-[125]
                rounded-full
                border-2
                border-[#FFE082]
                bg-[#06283a]/95
                px-5
                py-2.5
                text-[#FFE082]
                font-black
                shadow-xl
                backdrop-blur-md
              "
            >
              ✓ وجدت الدانة — حان وقت العودة إلى المحمل
            </div>

            <button"""
text = text.replace(needle, replacement, 1)

# Close fragment after the button block.
old = """          >
            <Award
              className="
                w-5
                h-5
              "
            />

            اصعد إلى المحمل بالدانة
          </button>
        )}"""
new = """          >
            <Award
              className="
                w-5
                h-5
              "
            />

            اصعد إلى المحمل بالدانة
          </button>
          </>
        )}"""
text = text.replace(old, new, 1)

out = Path("/mnt/data/PearlScene_fixed_dana.tsx")
out.write_text(text, encoding="utf-8")
print(f"Created {out} ({len(text.splitlines())} lines)")
